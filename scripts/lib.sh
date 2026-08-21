#
# Shared helpers for every script in this directory. Sourced, never executed.
#
#   source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
#   cd "$REPO"
#

SCRIPTS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPTS/.." && pwd)"

# cron gives us a minimal PATH; node, pm2 and restic live in /usr/local/bin
# appended, not prepended: an interactive caller's PATH still wins
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin"

DB="backend/directus/data.db"
UPLOADS="backend/directus/uploads"

# all output goes through gum; degrades to plaintext when stdout is not a terminal
command -v gum >/dev/null || { echo "gum is not installed — run scripts/provision.sh" >&2; exit 1; }

STEP=0
TOTAL="${TOTAL:-0}"

step()    { STEP=$((STEP + 1)); gum style --bold --foreground 4 "[$STEP/$TOTAL] $1"; }
success() { gum log --level info  "$1"; }
warn()    { gum log --level warn  "$1"; }
fail()    { gum log --level error "$1"; exit 1; }

# banner "text" [border colour, default blue]
banner() {
  gum style --border double --align center --width 45 --margin "1 0" \
    --border-foreground "${2:-4}" "$1"
}

install_caddyfile() {
  local src="$1"
  # validate the source, not the installed copy:
  # config that fails here must not already be in /etc/caddy, or next reboot starts Caddy on it
  sudo caddy validate --adapter caddyfile --config "$src" >/dev/null
  # copied, not symlinked: Ubuntu 24.04 home dirs are 0750 so caddy cannot see them
  sudo install -m 644 -o root -g root "$src" /etc/caddy/Caddyfile
  sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy
}

# poll an endpoint until it answers 2xx/3xx; returns 1 on timeout
wait_http() {
  local url="$1" tries="${2:-30}" i
  for ((i = 1; i <= tries; i++)); do
    curl -fs -o /dev/null --max-time 2 "$url" && return 0
    sleep 1
  done
  return 1
}
