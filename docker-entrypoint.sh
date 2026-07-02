#!/bin/sh
set -e

# Regenerate the runtime config from the environment so the Google Maps API key
# can be set/rotated via a Cloud Run env var (GOOGLE_MAPS_API_KEY) without a rebuild.
cat > /app/dist/config.js <<EOF
window.APP_CONFIG = { googleMapsApiKey: "${GOOGLE_MAPS_API_KEY:-}" };
EOF

exec serve -s dist -l 8080
