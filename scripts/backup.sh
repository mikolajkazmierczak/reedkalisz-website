#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH" # for cron env

#
# Create a dated backup next to the original DB, keeping only the 3 newest.
#

DB="../backend/directus/data.db"

[[ -f "$DB" ]] || { echo "Error: $DB not found." >&2; exit 1; }

DB_DIR="$(cd "$(dirname "$DB")" && pwd)"
STAMP="$(date +%d-%m-%Y)"
BACKUP="$DB_DIR/data-backup-${STAMP}.db"

echo "Backing up $DB -> $BACKUP"
sqlite3 "$DB" ".backup '$BACKUP'"

ls -1t "$DB_DIR"/data-backup-*.db 2>/dev/null | tail -n +4 | while read -r old; do
  echo "Removing old backup: $old"
  rm -f -- "$old"
done

echo "✅ Backup complete"
