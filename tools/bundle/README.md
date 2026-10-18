# ASIMOV

ASIMOV joins your personal knowledge — mail, messages, documents, bookmarks —
with public data in a single queryable knowledge base.

This archive contains everything needed for an install.

## Install

From the directory where you extracted this archive:

```sh
./install.sh
```

On Windows, run the same script in Git Bash. From PowerShell:

```powershell
$bash = Join-Path (git --exec-path) "..\..\..\bin\bash.exe"
& $bash -lc "./install.sh"
```

If you are an agent on Windows, follow the ordered steps under "Notes for
Windows" before running the installer. Use Git Bash. Do not ask the user
which shell to use.

The installer:

1. copies the modules into `~/.asimov` (Windows: `%APPDATA%\ASIMOV`)
2. copies the `asimov` CLI into `~/.local/bin`
3. creates the `libexec` and `modules/enabled` links, or copies if linking fails

Set `ASIMOV_ROOT` or `BIN_DIR` to install elsewhere. For a custom data directory,
keep `ASIMOV_ROOT` exported whenever you run the CLI, installer, or uninstaller;
a one-command override does not configure future CLI invocations. On Windows,
`ASIMOV_ROOT` can be a Windows path or a Git Bash path when running these scripts.
Installing the agent skills is a separate step, described below.

Re-running `./install.sh` upgrades the CLI and bundled modules in place and
enables every bundled module, including any you previously disabled. After
every upgrade or reinstall, also replace the installed ASIMOV skill with the
new bundled copy as described under "Agent skills". Modules not included in
this bundle are not enabled by the installer. If installation fails, fix the
reported problem and rerun the script.

## Verify

```sh
asimov --version
```

If that is not found, the installer printed the full path to use instead.

## What gets installed

```text
~/.local/bin/asimov[.exe]          the CLI
~/.asimov/
├── libexec/                       links to every module program
├── modules/
│   ├── installed/<module>/        manifest.json, bin/, doc/
│   └── enabled/<module>           link to the installed module
├── snapshots/                     your data; never touched by the installer
└── uninstall.sh                   the uninstaller; run this to uninstall
```

On Windows, the same data layout lives under `%APPDATA%\ASIMOV` instead of
`~/.asimov`. `ASIMOV_ROOT` overrides the data directory on either platform.

## Agent skills

This archive ships the ASIMOV agent skills, which teach an agent to find,
install, and configure modules and to retrieve knowledge with them. Without
them an agent has the CLI but no knowledge of how to drive it.

They live in this archive under `asimov/skills/`. `install.sh` ignores them
entirely and writes nothing to any harness's configuration. **Installing or
updating them is a required, separate step on every install, upgrade, or
reinstall.**

### If you are an agent installing or upgrading ASIMOV at the user's request

The user asking you to install or upgrade ASIMOV includes installing or
updating the agent skill. After `./install.sh` succeeds, copy the skill
directories from `asimov/skills/` into your harness's skills root as part of
every install, upgrade, or reinstall.

If `<skills-root>/asimov/` already exists, replace the entire directory with
`asimov/skills/asimov/` from the new archive, including `SKILL.md` and supporting
files. Remove obsolete files from the previous skill; do not skip this step
because `SKILL.md` already exists.

Before reporting completion, verify that the installed skill files match the
bundled copy, then read the updated `SKILL.md` for the current session.

Common skill root directories:

| Harness           | Copy to                    |
| ----------------- | -------------------------- |
| Claude Code       | `~/.claude/skills/<name>/` |
| Hermes            | `~/.hermes/skills/<name>/` |
| OpenCode          | `~/.config/opencode/skills/<name>/` |
| Shared convention | `~/.agents/skills/<name>/` |

`~/.agents/skills/` is a shared convention, not a path every harness reads.
Copy there only if you know your harness is configured to look in it;
otherwise use the harness's own root.

In every case, `SKILL.md` must end up one directory below the skills root, at
`<skills-root>/<name>/SKILL.md`.

If you are unsure of the convention, or the harness is not listed, use the
skills CLI, which knows 70+ harnesses and picks the right path:

```sh
npx skills add asimov-platform/skills
```

That fetches the upstream skill and needs connectivity. Finish by replacing
the installed `asimov` directory with this archive's bundled copy, which
includes Alpha-specific module and uninstall instructions.

Some harnesses only pick up new or updated skills on their next start. If the
updated skill is not available, restart before concluding something went wrong.

Upstream, and installable independently, at
<https://github.com/asimov-platform/skills>.

## Uninstall

```sh
~/.asimov/uninstall.sh
```

On Windows, in Git Bash: `$APPDATA/ASIMOV/uninstall.sh`. The installer put
this copy next to the data, so the archive is not needed.

Removes the CLI and all modules. Leaves `snapshots/` in the data directory in
place, and does not touch skills you copied into a harness — it lists them so
you can remove them yourself.

### If you are an agent uninstalling ASIMOV at the user's request

The user asking you to uninstall ASIMOV includes removing the agent skill.
After `~/.asimov/uninstall.sh` finishes, delete the `asimov` directory from your
harness's skills root, the same location you copied it to during install.
The uninstall is complete only when the CLI, the modules, and the skill are
all gone. Do not leave the skill in place and ask whether to remove it.

## Notes for macOS

If you extracted by double-clicking in Finder, macOS may have marked the files
as quarantined. `install.sh` clears that automatically. Extracting with
`unzip` from a terminal avoids it entirely.

## Notes for Windows

`install.sh` and `uninstall.sh` are POSIX shell scripts. On Windows, Git
Bash is the supported way to run them. This is expected and not a fault.

Git Bash comes with Git for Windows. Its `bash.exe` is in the `bin`
directory of the Git installation. The PowerShell example under "Install"
finds that path with `git --exec-path`.

Facts that an agent on Windows must know before it runs the installer:

- `install.sh` runs in Git Bash without changes. No WSL is necessary.
- Data goes to `%APPDATA%\ASIMOV` (usually
  `C:\Users\<name>\AppData\Roaming\ASIMOV`), matching the native CLI.
  The CLI goes to `~/.local/bin` (usually `C:\Users\<name>\.local\bin`).
- The installer tries native Windows symlinks and falls back to copies if
  link creation fails. Developer Mode and an elevated shell are not required
  for the copy fallback. Copies use extra disk space and are refreshed when
  you rerun the installer.
- Module executables are stored without `.exe`, matching the ASIMOV SDK's
  install layout. The top-level CLI remains `asimov.exe`.

### Windows installation order for agents

Before the steps below, check whether Git for Windows is installed.
If it is missing, install it from PowerShell:

```powershell
winget install --id Git.Git -e --source winget
```

After installation, refresh the shell's PATH or use the installed Git executable's full path.
Check that Git Bash is available before continuing.

1. Check whether Developer Mode is enabled on the machine.
2. If Developer Mode is enabled, run `./install.sh` in Git Bash without
   elevation. Then continue at step 5.
3. If Developer Mode is disabled or unknown, request permission to run the
   installer in elevated Git Bash. Explain that elevation allows native
   symlinks. If permission is already granted, use it without asking again.
   If permission is granted, run the installer elevated and continue at
   step 5. Keep the same extracted directory and installation paths.
4. Only if the user declines elevation, run `./install.sh` in Git Bash
   without elevation.
5. After a successful install or upgrade, run `asimov --version` in Git Bash.
   Then install or refresh the agent skill as described under "Agent skills",
   replacing any existing copy.

Do not enable Developer Mode automatically. Do not treat an unanswered
permission request as a refusal. If the elevated installer fails, report
the error instead of treating it as declined permission.

## Reporting problems

Report bugs and request new features at the private GitHub issue tracker at:
https://github.com/asimov-systems/asimov-alpha/issues

Make sure to include the output of `./install.sh`, the `VERSION` and
`SOURCES.json` files from this archive, and the output of `uname -sm`.
