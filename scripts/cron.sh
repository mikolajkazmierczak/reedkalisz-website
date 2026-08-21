#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

#
# The nightly job: cleanup.sh, which takes a backup before it touches anything.
#
#   ./scripts/cron.sh --enable | --disable | --status
#

JOB="0 3 * * * /usr/bin/env bash $SCRIPTS/cleanup.sh >> $SCRIPTS/cleanup.log 2>&1"
CONF=/etc/logrotate.d/reedkalisz-website

others="$(crontab -l 2>/dev/null | grep -vF "$SCRIPTS/cleanup.sh" || true)"

case "${1:-}" in
  --enable)
    if [[ -n "$others" ]]; then
      printf '%s\n%s\n' "$others" "$JOB" | crontab - || fail "crontab"
    else
      printf '%s\n' "$JOB" | crontab - || fail "crontab"
    fi
    sudo tee "$CONF" >/dev/null <<EOF
$SCRIPTS/*.log {
    su $USER $USER
    size 10M
    rotate 7
    missingok
    notifempty
    copytruncate
}
EOF
    success "enabled — daily at 3:00, logs rotate at 10M keeping 7"
    ;;

  --disable)
    if [[ -n "$others" ]]; then
      printf '%s\n' "$others" | crontab - || fail "crontab"
    else
      crontab -r 2>/dev/null || true
    fi
    sudo rm -f "$CONF"
    success "disabled"
    ;;

  --status)
    crontab -l 2>/dev/null | grep -F "$SCRIPTS/cleanup.sh" \
      && success "enabled" || warn "not enabled"
    ;;

  *) echo "usage: $0 --enable | --disable | --status" >&2; exit 1 ;;
esac
