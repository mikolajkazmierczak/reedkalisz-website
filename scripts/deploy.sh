#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

#
# Deploy the latest commit.
#
#   ./scripts/deploy.sh              pull, build, reload sveltekit
#   ./scripts/deploy.sh --full       ...and reload heimdall + directus
#   ./scripts/deploy.sh --install    ...and npm ci everything first
#   ./scripts/deploy.sh --caddy      reinstall Caddyfile, reload Caddy
#

FULL=0; INSTALL=0; CADDY=0
for arg in "$@"; do
  case "$arg" in
    --full)    FULL=1 ;;
    --install) INSTALL=1; FULL=1 ;;
    --caddy)   CADDY=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'
BOLD='\033[1m'; RESET='\033[0m'

STEP=0
TOTAL=$(( 4 + INSTALL * 4 + FULL * 2 + CADDY * 1 ))

step() {
  STEP=$((STEP + 1))
  echo -e "\n${BLUE}${BOLD}[${STEP}/${TOTAL}]${RESET} ${BOLD}$1${RESET}"
}
success() { echo -e "${GREEN}✔ $1${RESET}"; }
fail()    { echo -e "${RED}✖ Error during: $1${RESET}\n${RED}Deployment aborted.${RESET}"; exit 1; }

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}       Deployment Starting...          ${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

step "Pruning remote-tracking branches"
git fetch --prune || fail "git fetch --prune"
success "Fetch complete"

step "Pulling latest changes"
git pull || fail "git pull"
success "Now at $(git rev-parse --short HEAD)"

if [[ "$INSTALL" == "1" ]]; then
  step "Installing shared/";           (cd shared           && npm ci) || fail "npm ci shared"
  success "shared ready"
  step "Installing backend/directus";  (cd backend/directus && npm ci) || fail "npm ci directus"
  success "directus ready"
  step "Installing backend/heimdall";  (cd backend/heimdall && npm ci) || fail "npm ci heimdall"
  success "heimdall ready"
  step "Installing frontend";          (cd frontend         && npm ci) || fail "npm ci frontend"
  success "frontend ready"
fi

step "Building frontend"
(cd frontend && npm run build) || fail "npm run build"
success "Build complete"

if [[ "$CADDY" == "1" ]]; then
  step "Reloading Caddy"
  sudo install -m 644 -o root -g root Caddyfile /etc/caddy/Caddyfile || fail "install Caddyfile"
  sudo caddy validate --config /etc/caddy/Caddyfile >/dev/null || fail "caddy validate"
  sudo systemctl reload caddy || fail "systemctl reload caddy"
  success "Caddyfile applied"
fi

step "Reloading sveltekit"
pm2 startOrReload ecosystem.config.cjs --only sveltekit || fail "pm2 reload sveltekit"
success "sveltekit reloaded"

if [[ "$FULL" == "1" ]]; then
  step "Reloading heimdall"
  pm2 startOrReload ecosystem.config.cjs --only heimdall || fail "pm2 reload heimdall"
  success "heimdall reloaded"

  step "Restarting directus"
  # restart, not reload: Directus holds SQLite and does not reload cleanly
  pm2 restart directus --update-env || pm2 start ecosystem.config.cjs --only directus || fail "pm2 restart directus"
  success "directus restarted"
fi

step "Saving pm2 process list"
pm2 save --force >/dev/null || fail "pm2 save"
success "process list saved for boot"

echo ""
pm2 status

echo -e "\n${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}${BOLD}       Deployment Successful! ✔        ${RESET}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
