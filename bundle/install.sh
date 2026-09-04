#!/bin/sh
set -eu

src="$(cd "$(dirname "$0")" && pwd)/asimov"
ASIMOV_HOME="${ASIMOV_HOME:-$HOME/.asimov}"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

if [ -f "$src/bin/asimov.exe" ]; then
  suffix=.exe
else
  suffix=
fi

mkdir -p "$ASIMOV_HOME/modules/installed" "$ASIMOV_HOME/modules/enabled" \
  "$ASIMOV_HOME/libexec" "$ASIMOV_HOME/snapshots" "$BIN_DIR"

present=" $(ls "$ASIMOV_HOME/modules/installed" 2>/dev/null | tr '\n' ' ')"

for path in "$src"/modules/installed/*/; do
  module="$(basename "$path")"
  [ -d "$ASIMOV_HOME/modules/installed/$module" ] || continue
  for link in "$ASIMOV_HOME"/libexec/*; do
    case "$(readlink "$link" 2>/dev/null)" in
      *"/modules/installed/$module/bin/"*) rm -f "$link" ;;
    esac
  done
  rm -rf "$ASIMOV_HOME/modules/installed/$module"
done

cp -R "$src/modules/installed/." "$ASIMOV_HOME/modules/installed/"
cp "$src/bin/asimov$suffix" "$BIN_DIR/asimov$suffix"
chmod +x "$BIN_DIR/asimov$suffix" "$ASIMOV_HOME"/modules/installed/*/bin/*

if [ "$(uname -s)" = Darwin ]; then
  xattr -dr com.apple.quarantine \
    "$ASIMOV_HOME/modules" "$ASIMOV_HOME/libexec" \
    "$BIN_DIR/asimov$suffix" 2>/dev/null || true
fi

for path in "$ASIMOV_HOME"/modules/installed/*/; do
  module="$(basename "$path")"
  case "$present" in
    *" $module "*) ;;
    *) ASIMOV_ROOT="$ASIMOV_HOME" "$BIN_DIR/asimov$suffix" module enable "$module" ;;
  esac
  for prog in "$path"bin/*; do
    [ -f "$prog" ] || continue
    ln -sf "../modules/installed/$module/bin/$(basename "$prog")" "$ASIMOV_HOME/libexec/"
  done
  echo "installed module $module"
done

cli="$("$BIN_DIR/asimov$suffix" --version)"
echo "installed $cli at $BIN_DIR/asimov$suffix"

case ":${PATH}:" in
  *":$BIN_DIR:"*) ;;
  *) echo "warning: $BIN_DIR is not on your PATH; add it to use 'asimov' by name" ;;
esac
