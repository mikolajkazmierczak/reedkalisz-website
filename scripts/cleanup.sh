#!/usr/bin/env bash
set -euo pipefail

# Cleanup Directus revisions and activity logs to reduce database size.

cd "$(dirname "$0")"
DB="../backend/directus/data.db"ś

echo "Running backup..."
bash backup.sh

UP=0
pm2 pid directus >/dev/null 2>&1 && [[ "$(pm2 pid directus)" != "0" ]] && UP=1

if [[ "$UP" == "1" ]]; then
  echo "Stopping Directus..."
  pm2 stop directus
fi

echo "Before: $(sqlite3 "$DB" 'SELECT COUNT(*) FROM directus_revisions') revisions, $(sqlite3 "$DB" 'SELECT COUNT(*) FROM directus_activity') activity"

echo "Cleaning up revisions and activity tables..."
sqlite3 "$DB" <<'SQL'
PRAGMA foreign_keys = OFF;
DELETE FROM directus_revisions;
DELETE FROM directus_activity;
VACUUM;
SQL

echo "After:  $(sqlite3 "$DB" 'SELECT COUNT(*) FROM directus_revisions') revisions, $(sqlite3 "$DB" 'SELECT COUNT(*) FROM directus_activity') activity"

echo "Tables emptied and database vacuumed."

if [[ "$UP" == "1" ]]; then
  echo "Starting Directus..."
  pm2 start directus
fi

echo "✅ Cleanup complete"
