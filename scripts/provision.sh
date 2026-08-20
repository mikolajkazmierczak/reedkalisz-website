#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

#
# One-time setup for a fresh Ubuntu 24.04 server.
#
# Bootstrap on a new VPS:
#   sudo apt update && sudo apt install -y git
#   git clone <repo-url> ~/reedkalisz-website
#   ~/reedkalisz-website/scripts/provision.sh
#

# Directus 9.22 was last tested on Node 18.
NODE_VERSION="${NODE_VERSION:-v18.20.8}"
TIMEZONE="${TIMEZONE:-Europe/Warsaw}"

REPO="$(cd .. && pwd)"
CADDYFILE="$REPO/Caddyfile"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

STEP=0
TOTAL=9

step() {
  STEP=$((STEP + 1))
  echo -e "\n${BLUE}${BOLD}[${STEP}/${TOTAL}]${RESET} ${BOLD}$1${RESET}"
}

success() { echo -e "${GREEN}✔ $1${RESET}"; }
warn()    { echo -e "${YELLOW}! $1${RESET}"; }
fail()    { echo -e "${RED}✖ Error during: $1${RESET}"; exit 1; }

[[ $EUID -ne 0 ]] || fail "run as your normal user, not root (it will sudo where needed)"

echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}       Provisioning $(hostname)${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "repo:      $REPO"
echo -e "node:      $NODE_VERSION"
echo -e "timezone:  $TIMEZONE"

step "Setting timezone"
sudo timedatectl set-timezone "$TIMEZONE" || fail "timedatectl"
success "$(timedatectl show -p Timezone --value)"

step "Installing base packages"
sudo apt-get update -qq || fail "apt update"
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl git ufw sqlite3 rsync unzip xz-utils ca-certificates gnupg \
  debian-keyring debian-archive-keyring apt-transport-https \
  unattended-upgrades build-essential || fail "apt install"
success "base packages installed"

step "Installing Node $NODE_VERSION"
if [[ "$(node -v 2>/dev/null || true)" != "$NODE_VERSION" ]]; then
  curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" \
    | sudo tar -xJ -C /usr/local --strip-components=1 \
    || fail "node download (check the version exists at nodejs.org/dist)"
fi
success "node $(node -v), npm $(npm -v)"

step "Installing pm2"
if ! command -v pm2 >/dev/null; then
  sudo npm install -g pm2 --silent || fail "npm install pm2"
fi
pm2 install pm2-logrotate >/dev/null 2>&1 || warn "pm2-logrotate already present"
pm2 set pm2-logrotate:max_size 10M >/dev/null 2>&1 || true
pm2 set pm2-logrotate:retain 7 >/dev/null 2>&1 || true
success "pm2 $(pm2 -v)"

step "Enabling pm2 on boot"
sudo env PATH="$PATH:/usr/local/bin" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null \
  || fail "pm2 startup"
success "pm2 systemd unit installed (deploy.sh runs 'pm2 save' for you)"

step "Installing Caddy"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg || fail "caddy gpg key"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null || fail "caddy repo"
  sudo apt-get update -qq || fail "apt update (caddy)"
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq caddy || fail "apt install caddy"
fi
success "$(caddy version | head -1)"

step "Installing Caddyfile"
[[ -f "$CADDYFILE" ]] || fail "$CADDYFILE not found"
# copied, not symlinked: Ubuntu 24.04 home dirs are 0750 so the caddy user cannot see them
sudo install -m 644 -o root -g root "$CADDYFILE" /etc/caddy/Caddyfile || fail "install Caddyfile"
sudo caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1 || fail "caddy validate"
sudo systemctl reload caddy 2>/dev/null || sudo systemctl restart caddy || fail "reload caddy"
success "Caddyfile installed and validated"

step "Configuring firewall"
sudo ufw allow OpenSSH >/dev/null
sudo ufw allow 80/tcp   >/dev/null
sudo ufw allow 443/tcp  >/dev/null
sudo ufw --force enable >/dev/null || fail "ufw enable"
success "ufw active — 22, 80, 443 open"

step "Enabling unattended security upgrades"
sudo dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || warn "already configured"
success "security updates will install automatically"

echo -e "\n${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}${BOLD}       Provisioning Complete! ✔        ${RESET}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
echo -e "${BOLD}Still to do by hand (these need secrets or data):${RESET}"
echo -e "  1. Create the three .env files from the !.env templates"
echo -e "  2. Copy backend/directus/data.db and backend/directus/uploads/"
echo -e "  3. ./scripts/deploy.sh --install"
echo -e "  4. ./scripts/cleanup-cron.sh"
echo ""
