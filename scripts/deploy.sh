#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$REPO"

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

# ports must match the Caddyfile upstreams
SVELTEKIT_URL=http://127.0.0.1:5000/
HEIMDALL_URL=http://127.0.0.1:9999/
DIRECTUS_URL=http://127.0.0.1:8055/server/health

# fetch, pull, build, reload+verify sveltekit, pm2 save
TOTAL=$(( 5 + INSTALL * 4 + FULL * 2 + CADDY ))

banner "Deploying $(git rev-parse --short HEAD 2>/dev/null || echo "")"

# sudo prompt now instead of blocking halfway through a deploy
if [[ "$CADDY" == "1" ]]; then
  sudo -v
fi

step "Pruning remote-tracking branches"
git fetch --prune
success "Fetch complete"

step "Pulling latest changes"
# --ff-only: local changes on the server should stop the deploy
git pull --ff-only || fail "git pull --ff-only (local commits or edits on the server?)"
success "Now at $(git rev-parse --short HEAD)"

if [[ "$INSTALL" == "1" ]]; then
  step "Installing shared/";           (cd shared           && npm ci)
  success "shared ready"
  step "Installing backend/directus";  (cd backend/directus && npm ci)
  success "directus ready"
  step "Installing backend/heimdall";  (cd backend/heimdall && npm ci)
  success "heimdall ready"
  step "Installing frontend";          (cd frontend         && npm ci)
  success "frontend ready"
fi

step "Building frontend"
(cd frontend && npm run build)
success "Build complete"

if [[ "$CADDY" == "1" ]]; then
  step "Reloading Caddy"
  install_caddyfile Caddyfile
  success "Caddyfile applied"
fi

step "Reloading sveltekit"
pm2 startOrReload ecosystem.config.cjs --only sveltekit
wait_http "$SVELTEKIT_URL" || fail "sveltekit did not answer at $SVELTEKIT_URL (pm2 logs sveltekit)"
success "sveltekit reloaded and answering"

if [[ "$FULL" == "1" ]]; then
  step "Reloading heimdall"
  pm2 startOrReload ecosystem.config.cjs --only heimdall
  wait_http "$HEIMDALL_URL" || fail "heimdall did not answer at $HEIMDALL_URL (pm2 logs heimdall)"
  success "heimdall reloaded and answering"

  step "Restarting directus"
  # restart, not reload: Directus holds SQLite and does not reload cleanly
  pm2 restart directus --update-env || pm2 start ecosystem.config.cjs --only directus
  wait_http "$DIRECTUS_URL" 60 || fail "directus did not answer at $DIRECTUS_URL (pm2 logs directus)"
  success "directus restarted and healthy"
fi

step "Saving pm2 process list"
pm2 save --force >/dev/null
success "process list saved for boot"

echo ""
pm2 status

banner "Deployment Successful ✔" 2
