#!/usr/bin/env python3
"""Makes sure that ASIMOV is installed, or that it is fully removed.

Usage: ZIP=<bundle.zip> assert-asimov.py installed|uninstalled <skills-root>...

"installed": the CLI answers --version, every module the bundle ships is
installed and enabled with its programs linked, and asimov/SKILL.md is in
at least one of the given skills roots. The expected modules and programs
are read from the bundle zip named by the ZIP environment variable.
"uninstalled": the CLI, modules, and libexec links are gone, and no
skills root contains asimov/SKILL.md.
"""
import os
import re
import subprocess
import sys
import zipfile
from pathlib import Path

HOME = Path.home()
ASIMOV_HOME = Path(os.environ.get("ASIMOV_HOME", HOME / ".asimov"))
BIN = Path(os.environ.get("BIN_DIR", HOME / ".local" / "bin")) / "asimov"

failed = False


def check(cond, what):
    global failed
    print(("ok   " if cond else "FAIL ") + what)
    failed |= not cond


def installed(roots):
    try:
        out = subprocess.run([BIN, "--version"], capture_output=True, text=True, check=True).stdout.strip()
        check(True, f"cli: {out}")
    except (OSError, subprocess.CalledProcessError) as e:
        check(False, f"cli: {BIN} --version: {e}")
    for mod, progs in sorted(bundled_modules().items()):
        check((ASIMOV_HOME / "modules/installed" / mod / "manifest.json").is_file(), f"module {mod} installed")
        check((ASIMOV_HOME / "modules/enabled" / mod).exists(), f"module {mod} enabled")
        for prog in sorted(progs):
            check(os.access(ASIMOV_HOME / "libexec" / prog, os.X_OK), f"program {prog} linked")
    found = [r for r in roots if (r / "asimov/SKILL.md").is_file()]
    check(bool(found), f"skill at {found[0] / 'asimov/SKILL.md'}" if found else f"skill asimov/SKILL.md not found in: {roots}")
    if not found:
        locate_skill()


def bundled_modules():
    """Module name -> program names, from the bundle's asimov/modules/installed/<mod>/bin/<prog> entries."""
    if not os.environ.get("ZIP"):
        sys.exit("ZIP must name the bundle zip; without it no module check would run")
    mods = {}
    for name in zipfile.ZipFile(os.environ["ZIP"]).namelist():
        m = re.search(r"/asimov/modules/installed/([^/]+)/(manifest\.json|bin/([^/]+))$", name)
        if m:
            mods.setdefault(m.group(1), set())
            if m.group(3):
                mods[m.group(1)].add(m.group(3))
    if not mods:
        sys.exit(f"no modules found in {os.environ['ZIP']}")
    return mods


def uninstalled(roots):
    check(not BIN.exists(), f"cli removed ({BIN})")
    check(not (ASIMOV_HOME / "modules").exists(), "modules removed")
    check(not (ASIMOV_HOME / "libexec").exists(), "libexec removed")
    for r in roots:
        check(not (r / "asimov").exists(), f"skill removed from {r}")
    if failed:
        locate_skill()


def locate_skill():
    """Prints every SKILL.md under HOME and the current directory, to show where the agent put the skill."""
    # Hermes ships ~60 bundled skills; keep only paths that mention asimov.
    hits = sorted({p for base in (HOME, Path.cwd()) for p in base.rglob("SKILL.md") if "asimov" in str(p).lower()})
    print("     SKILL.md files found:" + ("".join("\n       " + str(p) for p in hits) or " none"))


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ("installed", "uninstalled"):
        sys.exit(__doc__.strip().splitlines()[2])
    {"installed": installed, "uninstalled": uninstalled}[sys.argv[1]]([Path(r) for r in sys.argv[2:]])
    sys.exit(1 if failed else 0)
