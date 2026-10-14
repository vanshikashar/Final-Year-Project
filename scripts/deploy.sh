
#!/bin/bash
set -euo pipefail

cd /opt/fyp

if [ ! -f .env ]; then
    echo "Missing /opt/fyp/.env configuration"
    exit 1
fi

docker compose config --quiet
docker compose up -d --build
docker compose ps
