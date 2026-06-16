#!/usr/bin/env bash
set -euo pipefail

# Create a dated backup next to the original DB, keeping only the 3 newest.

cd "$(dirname "$0")"
DB="../backend/directus/data.db"

[[ -f "$DB" ]] || { echo "Error: $DB not found." >&2; exit 1; }

DB_DIR="$(cd "$(dirname "$DB")" && pwd)" # absolute folder the DB lives in
STAMP="$(date +%d-%m-%Y)"
BACKUP="$DB_DIR/data-backup-${STAMP}.db"

echo "Backing up $DB -> $BACKUP"
sqlite3 "$DB" ".backup '$BACKUP'"

# Keep only the 3 newest backups in the DB's folder, delete the rest.
ls -1t "$DB_DIR"/data-backup-*.db 2>/dev/null | tail -n +4 | while read -r old; do
  echo "Removing old backup: $old"
  rm -f -- "$old"
done

echo "✅ Backup complete"
