#!/usr/bin/env bash
# Screenshots the app's real UI (dashboard page, site plugin, settings panel) into ./shots,
# using the harness in ./harness with sample store data. Run render.sh afterwards.
set -euo pipefail
cd "$(dirname "$0")"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT=5199
BASE="http://127.0.0.1:$PORT"

(cd ../.. && npx vite build --config marketing/app-market-media/harness/vite.config.ts --logLevel warn)

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory harness/dist >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1

mkdir -p shots
snap() { # <name> <path> <width,height>
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --virtual-time-budget=10000 --window-size="$3" \
    --screenshot="$PWD/shots/$1.png" "$BASE/$2" >/dev/null 2>&1
  echo "captured shots/$1.png"
}

snap dashboard-overview  "dashboard.html"                                          1280,1000
snap dashboard-campaigns "dashboard.html?tab=Campaigns&create=Headphones%20Care%20Kit" 1280,1000
snap thank-you           "plugin.html"                                             1280,860
snap editor-widget       "plugin.html?theme=brand"                                 900,860
snap mobile              "mobile.html"                                             600,844
snap panel               "panel.html"                                              320,1000

# Keep only the centered 390 x 844 phone iframe (at 2x); sips crops around the center.
sips -c 1688 780 shots/mobile.png >/dev/null
