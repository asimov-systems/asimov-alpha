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

mkdir -p "$ASIMOV_ROOT/modules/installed" "$ASIMOV_ROOT/modules/enabled" \
  "$ASIMOV_ROOT/libexec" "$ASIMOV_ROOT/snapshots" "$BIN_DIR"

present=" $(ls "$ASIMOV_ROOT/modules/installed" 2>/dev/null | tr '\n' ' ')"

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
cp "$src/bin/asimov$suffix" "$BIN_DIR/asimov$suffix"
chmod +x "$BIN_DIR/asimov$suffix" "$ASIMOV_ROOT"/modules/installed/*/bin/*

if [ "$(uname -s)" = Darwin ]; then
  xattr -dr com.apple.quarantine \
    "$ASIMOV_ROOT/modules" "$ASIMOV_ROOT/libexec" \
    "$BIN_DIR/asimov$suffix" 2>/dev/null || true
fi

for path in "$ASIMOV_ROOT"/modules/installed/*/; do
  module="$(basename "$path")"
  case "$present" in
    *" $module "*) ;;
    *) ASIMOV_ROOT="$ASIMOV_ROOT" "$BIN_DIR/asimov$suffix" module enable "$module" ;;
  esac
  for prog in "$path"bin/*; do
    [ -f "$prog" ] || continue
    ln -sf "../modules/installed/$module/bin/$(basename "$prog")" "$ASIMOV_ROOT/libexec/"
  done
  echo "installed module $module"
done

cli="$("$BIN_DIR/asimov$suffix" --version)"
echo "installed $cli at $BIN_DIR/asimov$suffix"

case ":${PATH}:" in
  *":$BIN_DIR:"*) ;;
  *) echo "warning: $BIN_DIR is not on your PATH; add it to use 'asimov' by name" ;;
esac
