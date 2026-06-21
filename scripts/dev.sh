#!/usr/bin/env bash
set -euo pipefail

# Local dev loop:
#   1. boot the Auth + Firestore emulators on the demo-uno project (data wiped each run)
#   2. start Vite pointed at the emulators (VITE_APP_ENV=dev)
# Ctrl+C tears the whole thing down — emulators:exec cleans up when Vite exits.

cd "$(dirname "$0")/.."

npx firebase emulators:exec \
  --only auth,firestore \
  --project demo-uno \
  "VITE_APP_ENV=dev npm run vite"
