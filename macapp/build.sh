#!/usr/bin/env bash
# Builds "Verification Bench.app" into ~/Applications. No dependencies beyond
# the Xcode command line tools. Re-run after changing Bench.swift.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
APP="${1:-$HOME/Applications/Verification Bench.app}"

mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
swiftc -O -target arm64-apple-macosx13.0 "$HERE/Bench.swift" -o "$APP/Contents/MacOS/VerificationBench"

ICONSET="$(mktemp -d)/Bench.iconset"
swiftc -O "$HERE/mkicon.swift" -o "$(dirname "$ICONSET")/mkicon"
"$(dirname "$ICONSET")/mkicon" "$ICONSET" >/dev/null
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/Bench.icns"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>Verification Bench</string>
  <key>CFBundleDisplayName</key><string>Verification Bench</string>
  <key>CFBundleIdentifier</key><string>store.airion.qa.bench</string>
  <key>CFBundleExecutable</key><string>VerificationBench</string>
  <key>CFBundleIconFile</key><string>Bench</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <key>BenchRepoPath</key><string>$REPO</string>
</dict></plist>
PLIST

echo "built: $APP"
