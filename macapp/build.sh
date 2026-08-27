#!/usr/bin/env bash
# Builds "Review.app" into ~/Applications. No dependencies beyond
# the Xcode command line tools. Re-run after changing Bench.swift.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
APP="${1:-$HOME/Applications/Review.app}"

mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
swiftc -O -target arm64-apple-macosx13.0 "$HERE/Bench.swift" -o "$APP/Contents/MacOS/Review"

ICONSET="$(mktemp -d)/Review.iconset"
swiftc -O "$HERE/mkicon.swift" -o "$(dirname "$ICONSET")/mkicon"
"$(dirname "$ICONSET")/mkicon" "$ICONSET" >/dev/null
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/Review.icns"

cat > "$APP/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>Review</string>
  <key>CFBundleDisplayName</key><string>Review</string>
  <!-- Bundle id stays as it is: macOS keys screen-recording and
       automation grants to it, and changing it asks for them again. -->
  <key>CFBundleIdentifier</key><string>store.airion.qa.bench</string>
  <key>CFBundleExecutable</key><string>Review</string>
  <key>CFBundleIconFile</key><string>Review</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>NSHighResolutionCapable</key><true/>
  <!-- The bench server is plain HTTP on 127.0.0.1. Without this, App Transport
       Security blocks both the readiness poll and the WKWebView load, and the
       app reports "did not come up" while the server is running fine. -->
  <key>NSAppTransportSecurity</key><dict>
    <key>NSAllowsLocalNetworking</key><true/>
  </dict>
  <key>BenchRepoPath</key><string>$REPO</string>
</dict></plist>
PLIST

echo "built: $APP"
