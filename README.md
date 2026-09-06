# ASIMOV Alpha

<a href="https://github.com/asimov-systems/asimov-alpha/releases/download/0.0.1/asimov-alpha-0.0.1-macos-arm.zip"><img width="220" alt="Download for macOS" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/download-macos.png?raw=true"/></a>
<a href="https://github.com/asimov-systems/asimov-alpha/releases/download/0.0.1/asimov-alpha-0.0.1-windows-x64.zip"><img width="220" alt="Download for Windows" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/download-windows.png?raw=true"/></a>
<a href="https://github.com/asimov-systems/asimov-alpha/releases/download/0.0.1/asimov-alpha-0.0.1-linux-x86-gnu.zip"><img width="220" alt="Download for Linux" src="https://github.com/asimov-systems/asimov-alpha/blob/master/.config/readmer/download-linux.png?raw=true"/></a>

## ✨ Features

- An exclusive private preview distribution of the [ASIMOV Platform] for social media intelligence.
- Plugs into your current agent harness as a sidecar; verified with Hermes,
  OpenClaw, Claude Code, etc.
- Makes social graphs transparent, disregarding typical barriers such as
  restrictive, expensive APIs.
- Currently supports **X** (fka Twitter), **Instagram**, **GitHub**, and
  <sup><sub>(coming soon!)</sub></sup> many more sources.

## ⬇️ Installation

1. Download the [latest zip] file from the OS-specific download buttons above.

2. Instruct your agent harness (e.g., [Hermes], [OpenClaw], [Claude Code], etc.)
   to unzip the file and install the contents:

```
Install `asimov-alpha-0.0.1-macos-arm.zip` from my Downloads folder
```

<details>
<summary>Technical details for the curious</summary>

TBD
</details>

## 👉 Examples

Copy a prompt into your agent, replacing `<username>` with your username.

### X (fka Twitter)

```text
Use ASIMOV to fetch my X profile, @<username>
```

```text
Use ASIMOV to list my X followers, @<username>
```

```text
Use ASIMOV to show who I follow on X, @<username>
```

### Instagram

```text
Use ASIMOV to get my Instagram profile, @<username>
```

### GitHub

```text
Use ASIMOV to look up my GitHub profile, @<username>
```

## 🧩 Compatibility

<details>
<summary>Models</summary>

### Models

| Model  | Compatible?  | Notes |
| ------ | ------------ | ----- |
| Anthropic Claude Fable 5.1  | ✓  |  |
| Anthropic Claude Fable 5  | ✓  |  |
| Anthropic Claude Haiku 4.5  | ✓  |  |
| Anthropic Claude Opus 5  | ✓  |  |
| Anthropic Claude Opus 4.6  | ✓  |  |
| Anthropic Claude Sonnet 5  | ✓  |  |
| DeepSeek V4 Flash 0731  | ✓  |  |
| DeepSeek V4 Pro  | ✓  |  |
| MoonshotAI Kimi K3  | ✓  |  |
| OpenAI GPT-6 Astra  | ✓  |  |
| OpenAI GPT-5.6 Luna  | ✓  |  |
| OpenAI GPT-5.5  | ✓  |  |
| OpenAI GPT-5.4  | ✓  | Hermes & Claude Code OK, OpenCode not |
| Z.ai GLM 5.2  | ✓  |  |
</details>

## ⚖️ Legal

> [!NOTE]
> *This is proprietary and confidential software not for redistribution.*

[latest zip]: https://github.com/asimov-systems/asimov-alpha/releases

[ASIMOV Platform]: https://github.com/asimov-platform
[Claude Code]: https://claude.com/product/claude-code
[Hermes]: https://hermes-agent.nousresearch.com/desktop
[OpenClaw]: https://openclaw.ai
