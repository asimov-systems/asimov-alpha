#!/usr/bin/env python3
"""Minimal ACP client: start an agent, open one session, send one prompt.

Usage: acp-drive.py --cwd DIR --prompt TEXT [--timeout SEC]
                    [--expect TEXT] [--expect-tool REGEX] [--expect-model TEXT]
                    -- <agent command...>

Speaks the Agent Client Protocol over stdio (JSON-RPC 2.0, one JSON object
per line). Every session/request_permission is answered with the first
"allow" option, so the agent never blocks on the host.

Exit code 1 when the turn does not end with stop reason end_turn, or when
the agent called a tool that asks the user a question. With --expect, the
agent's text must contain TEXT (case-insensitive). With --expect-tool, at
least one tool call (title plus rawInput) must match REGEX. With
--expect-model (default: the ACP_EXPECT_MODEL environment variable), the model
the agent reports at session start must contain TEXT; some agents silently
fall back to another model when the configured provider has no credentials.
Whether an install or uninstall was done is checked by the caller against the
filesystem.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import threading

QUESTION_TOOL = re.compile(r"askuserquestion|ask_user|^question\b", re.I)


def log(msg):
    print(f"[acp-drive] {msg}", file=sys.stderr, flush=True)


class Client:
    def __init__(self, cmd, cwd):
        self.proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, cwd=cwd, text=True, bufsize=1)
        self.next_id = 0
        self.text = []
        self.permissions = 0
        self.tools = {}  # toolCallId -> "title rawInput..."
        self.question_tools = []

    def send(self, obj):
        self.proc.stdin.write(json.dumps(obj) + "\n")
        self.proc.stdin.flush()

    def request(self, method, params):
        self.next_id += 1
        my_id = self.next_id
        self.send({"jsonrpc": "2.0", "id": my_id, "method": method, "params": params})
        while True:
            line = self.proc.stdout.readline()
            if not line:
                raise SystemExit(f"agent closed stdout while waiting for {method} response")
            msg = json.loads(line)
            if msg.get("id") == my_id and "method" not in msg:
                if "error" in msg:
                    raise SystemExit(f"{method} failed: {json.dumps(msg['error'])}")
                return msg["result"]
            self.handle_incoming(msg)

    def handle_incoming(self, msg):
        method = msg.get("method")
        params = msg.get("params") or {}
        if method == "session/update":
            self.on_update(params.get("update") or {})
            return
        if "id" not in msg:
            return  # other notification; nothing to do
        if method == "session/request_permission":
            self.permissions += 1
            options = params.get("options") or []
            pick = next((o for o in options if str(o.get("kind", "")).startswith("allow")), options[0] if options else None)
            title = (params.get("toolCall") or {}).get("title", "")
            log(f"permission requested for {title!r}; answering {pick and pick.get('optionId')}")
            result = {"outcome": {"outcome": "selected", "optionId": pick["optionId"]}} if pick else {"outcome": {"outcome": "cancelled"}}
            self.send({"jsonrpc": "2.0", "id": msg["id"], "result": result})
        elif method == "fs/read_text_file":
            with open(params["path"], encoding="utf-8") as f:
                self.send({"jsonrpc": "2.0", "id": msg["id"], "result": {"content": f.read()}})
        elif method == "fs/write_text_file":
            with open(params["path"], "w", encoding="utf-8") as f:
                f.write(params["content"])
            self.send({"jsonrpc": "2.0", "id": msg["id"], "result": {}})
        else:
            self.send({"jsonrpc": "2.0", "id": msg["id"], "error": {"code": -32601, "message": f"unsupported: {method}"}})

    def on_update(self, update):
        kind = update.get("sessionUpdate")
        if kind == "agent_message_chunk":
            content = update.get("content") or {}
            if content.get("type") == "text":
                self.text.append(content["text"])
                sys.stderr.write(content["text"])
                sys.stderr.flush()
        elif kind in ("tool_call", "tool_call_update"):
            # Some agents title every shell call "Terminal" and send the command as
            # rawInput, often only in a later tool_call_update. Keep one record per
            # toolCallId with the title and every rawInput seen.
            call_id = update.get("toolCallId")
            raw = json.dumps(update["rawInput"]) if update.get("rawInput") else ""
            if kind == "tool_call":
                title = update.get("title", "")
                log(f"tool: {title} {raw[:200]}")
                self.tools[call_id] = title + " " + raw
                if QUESTION_TOOL.search(title):
                    self.question_tools.append(title)
            elif call_id in self.tools:
                # Claude Code's adapter emits tool_call before the input has streamed,
                # then sends the real title (the command) and rawInput in an update.
                extra = " ".join(x for x in (update.get("title", ""), raw) if x and x not in self.tools[call_id])
                if extra:
                    log(f"tool input: {extra[:200]}")
                    self.tools[call_id] += " " + extra


def session_model(session):
    """The model the agent reports for a new session, or None when it reports nothing.

    Two shapes exist: `models.currentModelId` (Claude adapter), and a "model"
    select entry in `configOptions` whose `currentValue` is the model (OpenCode).
    """
    current = (session.get("models") or {}).get("currentModelId")
    if current:
        return current
    for option in session.get("configOptions") or []:
        if "model" in str(option.get("id", "")).lower() or option.get("category") == "model":
            return option.get("currentValue")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cwd", required=True)
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--timeout", type=int, default=900)
    ap.add_argument("--expect", help="text the agent's reply must contain (case-insensitive)")
    ap.add_argument("--expect-tool", help="regex at least one tool call must match (title plus rawInput)")
    ap.add_argument("--expect-model", default=os.environ.get("ACP_EXPECT_MODEL"),
                    help="text the session's reported model must contain (default: $ACP_EXPECT_MODEL)")
    ap.add_argument("cmd", nargs=argparse.REMAINDER)
    args = ap.parse_args()
    cmd = args.cmd[1:] if args.cmd and args.cmd[0] == "--" else args.cmd
    if not cmd:
        ap.error("agent command missing")

    c = Client(cmd, args.cwd)
    timer = threading.Timer(args.timeout, lambda: (log("timeout; killing agent"), c.proc.kill()))
    timer.daemon = True
    timer.start()

    init = c.request("initialize", {
        "protocolVersion": 1,
        "clientCapabilities": {"fs": {"readTextFile": True, "writeTextFile": True}, "terminal": False},
        "clientInfo": {"name": "acp-drive", "version": "0.1.0"},
    })
    log(f"agent: {json.dumps(init.get('agentInfo') or {})}")
    session = c.request("session/new", {"cwd": args.cwd, "mcpServers": []})
    session_id = session["sessionId"]
    model = session_model(session)
    log(f"session {session_id}; model: {model}; prompt: {args.prompt!r}")
    result = c.request("session/prompt", {"sessionId": session_id, "prompt": [{"type": "text", "text": args.prompt}]})
    timer.cancel()
    c.proc.stdin.close()
    c.proc.wait(timeout=30)

    sys.stderr.write("\n")
    stop = result.get("stopReason")
    log(f"stopReason={stop} permissions_auto_approved={c.permissions}")

    failures = []
    if stop != "end_turn":
        failures.append(f"stop reason is {stop!r}, expected 'end_turn'")
    if c.question_tools:
        failures.append(f"agent used a question tool: {c.question_tools}")
    if args.expect and args.expect.lower() not in "".join(c.text).lower():
        failures.append(f"reply does not contain {args.expect!r}")
    if args.expect_tool and not any(re.search(args.expect_tool, t, re.I | re.S) for t in c.tools.values()):
        failures.append(f"no tool call matched /{args.expect_tool}/")
    if args.expect_model and args.expect_model.lower() not in str(model).lower():
        failures.append(f"session model is {model!r}, expected it to contain {args.expect_model!r}")
    for f in failures:
        log(f"FAIL: {f}")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        # Turn transcript on the run's summary page, so nobody has to dig through step logs.
        tools = "".join(f"- `{t}`\n" for t in c.tools.values())
        fails = "".join(f", FAIL: {x}" for x in failures)
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write(f"## {args.prompt}\n\nstopReason `{stop}`, permissions auto-approved {c.permissions}{fails}\n\n"
                    f"<details><summary>tool calls</summary>\n\n{tools}\n</details>\n\n"
                    f"<details><summary>agent said</summary>\n\n{''.join(c.text)}\n\n</details>\n\n")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
