#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$REPO"

#
# Snapshot the db locally, then push db + uploads + secrets to Cloudflare R2 (encrypted, via restic).
# Configured in scripts/.env - otherwise local only.
#

[[ -f "$DB" ]] || fail "$DB not found"

DB_DIR="$(dirname "$DB")"
BACKUP="$DB_DIR/data-backup-$(date +%Y-%m-%d).db"

echo "Backing up $DB -> $BACKUP"
# .backup is a consistent online copy - safe while Directus is running
sqlite3 "$DB" ".backup '$BACKUP'" || fail "sqlite3 .backup"

ls -1t "$DB_DIR"/data-backup-*.db | tail -n +4 | xargs -r rm -f
success "local snapshot complete"

if [[ ! -f scripts/.env ]]; then
  warn "scripts/.env missing — local backup only (see scripts/!.env)"
  exit 0
fi

set -a
# shellcheck disable=SC1091
source scripts/.env
set +a

# scripts/.env is deliberately not backed up: it holds RESTIC_PASSWORD,
# (a password sealed inside the archive it unlocks is useless)
restic cat config >/dev/null 2>&1 || restic init || fail "restic init (check bucket and token)"

restic backup --tag daily \
  "$BACKUP" "$UPLOADS" backend/directus/.env backend/heimdall/.env frontend/.env \
  || fail "restic backup"

restic forget --tag daily --prune \
  --keep-daily   "${RESTIC_KEEP_DAILY:-14}" \
  --keep-weekly  "${RESTIC_KEEP_WEEKLY:-4}" \
  --keep-monthly "${RESTIC_KEEP_MONTHLY:-6}"

success "off-site backup complete"
