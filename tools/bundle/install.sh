#!/bin/sh
set -eu

src="$(cd "$(dirname "$0")" && pwd)/asimov"
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    ASIMOV_ROOT="$(cygpath -u "${ASIMOV_ROOT:-${APPDATA:?APPDATA must be set}/ASIMOV}")"
    export MSYS="${MSYS:+$MSYS }winsymlinks:nativestrict"
    export CYGWIN="${CYGWIN:+$CYGWIN }winsymlinks:nativestrict"
    ;;
  *) ASIMOV_ROOT="${ASIMOV_ROOT:-$HOME/.asimov}" ;;
esac
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

if [ -f "$src/bin/asimov.exe" ]; then
  suffix=.exe
else
  suffix=
fi
ASIMOV_CLI="$BIN_DIR/asimov$suffix"

mkdir -p "$ASIMOV_ROOT/modules/installed" "$ASIMOV_ROOT/modules/enabled" \
  "$ASIMOV_ROOT/libexec" "$ASIMOV_ROOT/snapshots" "$BIN_DIR"

if [ ! -e "$ASIMOV_ROOT/.env" ]; then
  printf '%s\n' 'ASIMOV_RELAY_URL=https://relay.alpha.asimov.systems' > "$ASIMOV_ROOT/.env"
fi

for path in "$src"/modules/installed/*/; do
  module="$(basename "$path")"
  [ -d "$ASIMOV_ROOT/modules/installed/$module" ] || continue
  for prog in "$ASIMOV_ROOT/modules/installed/$module/bin/"*; do
    [ -f "$prog" ] || [ -L "$prog" ] || continue
    rm -f "$ASIMOV_ROOT/libexec/$(basename "$prog")"
  done
  rm -rf "$ASIMOV_ROOT/modules/installed/$module"
done

cp -R "$src/modules/installed/." "$ASIMOV_ROOT/modules/installed/"
cp "$src/bin/asimov$suffix" "$ASIMOV_CLI"
chmod +x "$ASIMOV_CLI" "$ASIMOV_ROOT"/modules/installed/*/bin/*

if [ "$(uname -s)" = Darwin ]; then
  xattr -dr com.apple.quarantine \
    "$ASIMOV_ROOT/modules" "$ASIMOV_ROOT/libexec" \
    "$ASIMOV_CLI" 2>/dev/null || true
fi

for path in "$src"/modules/installed/*/; do
  module="$(basename "$path")"
  enabled="$ASIMOV_ROOT/modules/enabled/$module"
  rm -rf "$enabled"
  if ! ln -s "../installed/$module" "$enabled"; then
    echo "symlink unavailable; copying module $module"
    cp -R "$ASIMOV_ROOT/modules/installed/$module" "$enabled"
  fi
  for prog in "$ASIMOV_ROOT/modules/installed/$module/bin/"*; do
    [ -f "$prog" ] || continue
    name="$(basename "$prog")"
    rm -f "$ASIMOV_ROOT/libexec/$name"
    if ! ln -s "../modules/installed/$module/bin/$name" "$ASIMOV_ROOT/libexec/$name"; then
      echo "symlink unavailable; copying program $name"
      cp "$prog" "$ASIMOV_ROOT/libexec/$name"
    fi
  done
  echo "installed module $module"
done

cli="$(ASIMOV_TELEMETRY=0 "$ASIMOV_CLI" --version)"
echo "installed $cli at $ASIMOV_CLI"

public_key="$HOME/.asimov/keyring/$(id -un)"
if [ -f "$public_key" ]; then
  mkdir -p "$ASIMOV_ROOT/.telemetry"
  printf '{"public_key":"%s"}\n' "$(cat "$public_key")" \
    > "$ASIMOV_ROOT/.telemetry/custom-ids.json"
fi

# These modules have been retired and should no longer remain installed:
if [ -d "$ASIMOV_ROOT/modules/installed/relay" ]; then
  "$ASIMOV_CLI" module uninstall relay
fi
if [ -d "$ASIMOV_ROOT/modules/installed/social" ]; then
  "$ASIMOV_CLI" module uninstall social
fi

# A later session may not have the archive. Keep the uninstaller next to the
# data, so "uninstall" has an official script to run instead of a hand-written
# rm -rf.
cp "$(dirname "$src")/uninstall.sh" "$ASIMOV_ROOT/uninstall.sh"
chmod +x "$ASIMOV_ROOT/uninstall.sh"
echo "to uninstall later: $ASIMOV_ROOT/uninstall.sh"

case ":${PATH}:" in
  *":$BIN_DIR:"*) ;;
  *) echo "warning: $BIN_DIR is not on your PATH; add it to use 'asimov' by name" ;;
esac

# Skills are the agent's job (see README.md, "Agent skills"). Say so where
# an agent will see it: in the output of the script it just ran.
echo
echo "The agent skill is part of ASIMOV. This script does not install or update it;"
echo "the agent must do so using its harness's skills root."
echo "On every install, upgrade, or reinstall, copy this bundle's skill to"
echo "<skills-root>/asimov/, even if SKILL.md already exists:"
echo "  copy $src/skills/asimov/ to <skills-root>/asimov/, replacing the entire existing skill directory"
echo "  include all supporting files and remove obsolete files from the old skill"
echo "  verify the installed skill matches this bundle before reporting completion"
echo "  skills-root: Claude Code ~/.claude/skills, Hermes ~/.hermes/skills, OpenCode ~/.config/opencode/skills"
echo "  If you are an agent, this step is yours. See README.md, section 'Agent skills'."
