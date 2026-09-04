#!/bin/sh
set -eu

ASIMOV_HOME="${ASIMOV_HOME:-$HOME/.asimov}"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

skills=""
for skill in "$(cd "$(dirname "$0")" && pwd)"/asimov/skills/*/; do
  [ -f "$skill/SKILL.md" ] || continue
  skills="$skills $(basename "$skill")"
done

rm -f "$BIN_DIR/asimov" "$BIN_DIR/asimov.exe"
rm -rf "$ASIMOV_HOME/libexec" "$ASIMOV_HOME/modules"

echo "removed ASIMOV from $ASIMOV_HOME and $BIN_DIR"
echo "kept $ASIMOV_HOME/snapshots (your data); delete it manually if you want it gone"
if [ -n "$skills" ]; then
  echo "note: skills copied into an agent harness were not removed; delete these"
  echo "      from its skills directory yourself:$skills"
fi
