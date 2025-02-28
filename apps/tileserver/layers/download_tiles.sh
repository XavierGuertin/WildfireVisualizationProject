#!/bin/sh

set -e

TILE_DIR="/tileserver"
MBTILES_FILE="OAM-World-1-8-min-J80.mbtiles"
DOWNLOAD_URL="https://ftp.gwdg.de/pub/misc/openstreetmap/openandromaps/world/OAM-World-1-8-min-J80.mbtiles"

# Ensure the directory exists
mkdir -p "$TILE_DIR"

# Check if the MBTiles file already exists
if [ ! -f "$TILE_DIR/$MBTILES_FILE" ]; then
    echo "⬇️ Downloading MBTiles file..."
    curl -o "$TILE_DIR/$MBTILES_FILE" "$DOWNLOAD_URL"
    echo "✅ Download complete!"
else
    echo "✅ MBTiles file already exists, skipping download."
fi
