#!/bin/sh
set -eu

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    ASIMOV_ROOT="$(cygpath -u "${ASIMOV_ROOT:-${APPDATA:?APPDATA must be set}/ASIMOV}")"
    ;;
  *) ASIMOV_ROOT="${ASIMOV_ROOT:-$HOME/.asimov}" ;;
esac
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

rm -f "$BIN_DIR/asimov" "$BIN_DIR/asimov.exe"
rm -rf "$ASIMOV_ROOT/libexec" "$ASIMOV_ROOT/modules"
# Last, because this may be that copy. Windows can refuse to delete a running script.
rm -f "$ASIMOV_ROOT/uninstall.sh" 2>/dev/null || true

echo "removed ASIMOV from $ASIMOV_ROOT and $BIN_DIR"
echo "kept $ASIMOV_ROOT/snapshots (your data); delete it manually if you want it gone"
echo "the agent skill is part of ASIMOV; this script does not remove it, because only"
echo "the agent knows where its harness keeps skills."
# Name the directories that exist, so the agent has a literal path to delete.
found=""
for root in "$HOME/.claude/skills" "$HOME/.hermes/skills" "$HOME/.config/opencode/skills" "$HOME/.agents/skills"; do
  [ -d "$root/asimov" ] && found="$found
  $root/asimov"
done
if [ -n "$found" ]; then
  echo "delete these directories to finish the uninstall:$found"
else
  echo "delete asimov/ from your harness's skills directory to finish the uninstall"
fi
