#!/bin/sh
set -eu

case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    ASIMOV_ROOT="$(cygpath -u "${ASIMOV_ROOT:-${APPDATA:?APPDATA must be set}/ASIMOV}")"
    ;;
  *) ASIMOV_ROOT="${ASIMOV_ROOT:-$HOME/.asimov}" ;;
esac
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

skills=""
for skill in "$(cd "$(dirname "$0")" && pwd)"/asimov/skills/*/; do
  [ -f "$skill/SKILL.md" ] || continue
  skills="$skills $(basename "$skill")"
done

rm -f "$BIN_DIR/asimov" "$BIN_DIR/asimov.exe"
rm -rf "$ASIMOV_ROOT/libexec" "$ASIMOV_ROOT/modules"

echo "removed ASIMOV from $ASIMOV_ROOT and $BIN_DIR"
echo "kept $ASIMOV_ROOT/snapshots (your data); delete it manually if you want it gone"
if [ -n "$skills" ]; then
  echo "note: skills copied into an agent harness were not removed; delete these"
  echo "      from its skills directory yourself:$skills"
fi
