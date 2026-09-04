# ASIMOV (alpha)

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

If you are an agent on Windows, use Git Bash. Do not ask the user which
shell to use.

The installer:

1. copies the modules into `~/.asimov`
2. copies the `asimov` CLI into `~/.local/bin`
3. creates the `libexec` and `modules/enabled` links

Set `ASIMOV_HOME` or `BIN_DIR` to install elsewhere. Modules you have
explicitly disabled stay disabled across an upgrade. Installing the agent
skills is a separate step, described below.

Re-running `./install.sh` upgrades in place.

## Verify

```sh
asimov --version
```

If that is not found, the installer printed the full path to use instead.

## What gets installed

```
~/.local/bin/asimov[.exe]          the CLI
~/.asimov/
├── libexec/                       links to every module program
├── modules/
│   ├── installed/<module>/        manifest.json, bin/, doc/
│   └── enabled/<module>           link to the installed module
└── snapshots/                     your data; never touched by the installer
```

## Agent skills

This archive ships the ASIMOV agent skills, which teach an agent to find,
install, and configure modules and to retrieve knowledge with them. Without
them an agent has the CLI but no knowledge of how to drive it.

They live in this archive under `asimov/skills/`. `install.sh` ignores them
entirely and writes nothing to any harness's configuration. **Installing them
is a deliberate, separate step** — take it now, or the CLI will be there but
your agent will not know how to use it.

### If you are an agent installing ASIMOV at the user's request

The user asking you to install ASIMOV includes installing the agent skill.
Copy the skill directories from `asimov/skills/` into your harness's skills
root as part of the install — this is an intended, required step, not an
optional one. The skill teaches you how to drive the CLI you just installed;
without it the install is incomplete.

Two common skill root directories:

| Harness     | Copy to                    |
| ----------- | -------------------------- |
| Claude Code | `~/.claude/skills/<name>/` |
| Hermes      | `~/.hermes/skills/<name>/` |

Either way, `SKILL.md` must end up one directory below the skills root, at
`<skills-root>/<name>/SKILL.md`.

If you are unsure of the convention, or the harness is not listed, use the
skills CLI, which knows 70+ harnesses and picks the right path:

```sh
npx skills add asimov-platform/skills
```

That fetches from the network rather than using the bundled copy, so it needs
connectivity, and it may install a newer version than the one in this archive.

Some harnesses only pick up new skills on their next start. If the skill does
not appear, restart before concluding something went wrong.

Upstream, and installable independently, at
<https://github.com/asimov-platform/skills>.

## Uninstall

```sh
./uninstall.sh
```

Removes the CLI and all modules. Leaves `~/.asimov/snapshots` in place, and
does not touch skills you copied into a harness — it lists them so you can
remove them yourself.

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
- `~` in Git Bash is `C:\Users\<name>`. The files go to
  `C:\Users\<name>\.asimov` and `C:\Users\<name>\.local\bin`.
- `ln -s` in Git Bash makes a copy by default, so the installer enables
  modules through `asimov module enable`, which creates a real symlink. That
  needs Developer Mode or an elevated shell on Windows.

The install and uninstall steps are safe to run without further questions.
If you are an agent, run `./install.sh` in Git Bash and then verify with
`asimov --version` in Git Bash.

## Reporting problems

Include the output of `./install.sh`, the `VERSION` and `SOURCES.json` files
from this archive, and `uname -sm`.
