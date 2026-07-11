#!/bin/sh
set -e

cd /app

echo "Running database migrations..."
./node_modules/.bin/drizzle-kit migrate

exec node dist/main.js
