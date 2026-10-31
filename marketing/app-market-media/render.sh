#!/usr/bin/env bash
# Renders the App Market media into ./output using headless Chrome (macOS).
#   Images: 2400 x 1800 PNG (1200 x 900 at 2x, 4:3)
#   Banner: 540 x 360 JPG
set -euo pipefail
cd "$(dirname "$0")"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p output

shot() { # <html> <png> <width> <height> [scale]
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor="${5:-2}" \
    --virtual-time-budget=6000 --window-size="$3,$4" \
    --screenshot="$PWD/$2" "file://$PWD/src/$1" >/dev/null 2>&1
  echo "rendered $2"
}

for f in src/0*.html; do
  name="$(basename "$f" .html)"
  shot "$name.html" "output/$name.png" 1200 900
done

# App icon: 1000 x 1000, 24-bit PNG (no alpha), tagged sRGB.
shot icon.svg output/app-icon.png 1000 1000 1
sips --embedProfile "/System/Library/ColorSync/Profiles/sRGB Profile.icc" output/app-icon.png >/dev/null
cp output/app-icon.png ../../public/post-purchase-offers-logo.png

# Rendered at 1x: downscaling with sips introduces artifacts.
shot banner.html output/banner.png 540 360 1
sips -s format jpeg -s formatOptions 95 output/banner.png --out output/banner.jpg >/dev/null
rm output/banner.png
echo "rendered output/banner.jpg"
