#!/usr/bin/env bash
set -euo pipefail

# Toggle the daily 3:00 AM cron job for cleanup.sh.

cd "$(dirname "$0")"
DIR="$(pwd)"
JOB="0 3 * * * /usr/bin/env bash $DIR/cleanup.sh >> $DIR/cleanup.log 2>&1"

current="$(crontab -l 2>/dev/null || true)"

if grep -qF "$DIR/cleanup.sh" <<<"$current"; then
  grep -vF "$DIR/cleanup.sh" <<<"$current" | crontab - || true
  echo "❌ Cron job disabled."
else
  printf '%s\n%s\n' "$current" "$JOB" | crontab -
  echo "✅ Cron job enabled — runs daily at 3:00 AM."
fi
