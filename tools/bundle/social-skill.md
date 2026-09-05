## Social module (alpha)

The alpha bundle includes the private `social` module for social profiles and
follower networks. Before using it, run `asimov module doc social` for
supported URLs and examples. It is bundled locally, not discoverable through
the public module index.

## Uninstall

When the user asks you to uninstall ASIMOV, do these steps as one task:

1. Run the uninstaller that the installer left next to the data:
   `~/.asimov/uninstall.sh` (Windows, in Git Bash: `$APPDATA/ASIMOV/uninstall.sh`).
   It removes the CLI and the modules. Do not delete these by hand.
2. Keep `snapshots/` in the data directory. It is user data. Delete it only if
   the user asks for that.
3. Delete this skill from your harness's skills root (the directory that
   holds this `SKILL.md`). The skill is part of ASIMOV, not part of your
   configuration. The uninstall is complete only when the skill is gone too.
