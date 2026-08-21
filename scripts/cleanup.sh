#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$REPO"

#
# Empty Directus revisions and activity logs to reduce database size.
#

[[ -f "$DB" ]] || fail "$DB not found"

./scripts/backup.sh || fail "backup"

counts() { sqlite3 "$DB" 'SELECT (SELECT COUNT(*) FROM directus_revisions)||" revisions, "||(SELECT COUNT(*) FROM directus_activity)||" activity"'; }

echo "Before: $(counts)"

pm2 stop directus || fail "pm2 stop directus"
# whatever happens next, Directus comes back
trap 'pm2 start directus' EXIT

sqlite3 "$DB" <<'SQL'
PRAGMA foreign_keys = OFF;
DELETE FROM directus_revisions;
DELETE FROM directus_activity;
VACUUM;
SQL

echo "After:  $(counts)"
success "Cleanup complete"
