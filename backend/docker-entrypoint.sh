#!/bin/sh
set -e

# Sync seed data to data directory if data directory is empty or files are missing
if [ ! -f "/app/data/equipment-items.json" ] || [ ! -s "/app/data/equipment-items.json" ]; then
    echo "🔄 Syncing seed data..."
    cp /app/seed-data/* /app/data/ 2>/dev/null || true
fi

# Start the server
exec node server.js
