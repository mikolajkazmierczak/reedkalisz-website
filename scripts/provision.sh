#!/usr/bin/env bash
set -euo pipefail

if ! command -v gum >/dev/null; then
  echo "Installing gum..."
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl gnupg ca-certificates
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://repo.charm.sh/apt/gpg.key \
    | sudo gpg --dearmor --yes -o /etc/apt/keyrings/charm.gpg
  echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" \
    | sudo tee /etc/apt/sources.list.d/charm.list >/dev/null
  sudo chmod o+r /etc/apt/keyrings/charm.gpg /etc/apt/sources.list.d/charm.list
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq gum
fi

TOTAL=11
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$REPO"

#
# One-time setup for a fresh Ubuntu 24.04 server.
#
# Bootstrap on a new VPS:
#   sudo apt update && sudo apt install -y git
#   git clone <repo-url> ~/reedkalisz-website
#   ~/reedkalisz-website/scripts/provision.sh
#

# Directus 9.22 was last tested on Node 18.
NODE_MAJOR="${NODE_MAJOR:-18}"
TIMEZONE="${TIMEZONE:-Europe/Warsaw}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

CADDYFILE="$REPO/Caddyfile"
BETA_AUTH_CONF=/etc/caddy/beta-auth.conf

# fail here rather than seven steps in
[[ -f scripts/.env ]] || fail "scripts/.env missing — copy scripts/!.env and fill it in first"
set -a
# shellcheck disable=SC1091
source scripts/.env
set +a
[[ -n "${BETA_AUTH_PASSWORD:-}" ]] || fail "BETA_AUTH_PASSWORD is empty in scripts/.env"

[[ $EUID -ne 0 ]] || fail "run as your normal user, not root (it will sudo where needed)"

banner "Provisioning $(hostname)"
echo -e "repo:      $REPO"
echo -e "node:      $NODE_MAJOR.x"
echo -e "timezone:  $TIMEZONE"
echo -e "swap:      $SWAP_SIZE"

sudo -v

step "Setting timezone"
sudo timedatectl set-timezone "$TIMEZONE"
success "$(timedatectl show -p Timezone --value)"

step "Installing base packages"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  curl git ufw sqlite3 rsync unzip xz-utils ca-certificates gnupg \
  debian-keyring debian-archive-keyring apt-transport-https \
  unattended-upgrades build-essential restic
success "base packages installed"

step "Creating swap"
# without swap the OOM killer takes Directus (`vite build` takes ~1.86G of RAM)
if [[ -f /swapfile ]]; then
  success "swapfile already exists"
else
  sudo fallocate -l "$SWAP_SIZE" /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  success "$SWAP_SIZE swapfile active and in /etc/fstab"
fi

step "Installing Node $NODE_MAJOR"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | sudo gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
    | sudo tee /etc/apt/sources.list.d/nodesource.list >/dev/null
  sudo chmod o+r /etc/apt/keyrings/nodesource.gpg /etc/apt/sources.list.d/nodesource.list
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs
fi
success "node $(node -v), npm $(npm -v)"

step "Installing pm2"
if ! command -v pm2 >/dev/null; then
  sudo npm install -g pm2 --silent
fi
if [[ ! -d "$HOME/.pm2/node_modules/pm2-logrotate" ]]; then
  pm2 install pm2-logrotate >/dev/null
fi
pm2 set pm2-logrotate:max_size 10M >/dev/null 2>&1 || true
pm2 set pm2-logrotate:retain 7 >/dev/null 2>&1 || true
success "pm2 $(pm2 -v), logs rotate at 10M keeping 7"

step "Enabling pm2 on boot"
sudo env PATH="$PATH:/usr/local/bin" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null
success "pm2 systemd unit installed (deploy.sh runs 'pm2 save' for you)"

step "Installing Caddy"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | sudo gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | sudo tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  # apt fetches as the unprivileged _apt user; gpg --dearmor writes 0600
  sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq caddy
fi
success "$(caddy version | head -1)"

step "Setting up beta.reed.kalisz.pl basic auth"
# only the bcrypt hash (NOT the password) reaches the server config
if sudo test -f "$BETA_AUTH_CONF"; then
  success "already configured — delete $BETA_AUTH_CONF to change the password"
else
  printf 'basic_auth {\n\t%s %s\n}\n' \
    "$BETA_AUTH_USER" "$(caddy hash-password --plaintext "$BETA_AUTH_PASSWORD")" \
    | sudo tee "$BETA_AUTH_CONF" >/dev/null
  sudo chown root:caddy "$BETA_AUTH_CONF"
  sudo chmod 640 "$BETA_AUTH_CONF"
  success "basic auth configured for user $BETA_AUTH_USER"
fi

step "Installing Caddyfile"
install_caddyfile "$CADDYFILE"
success "Caddyfile installed and validated"

step "Configuring firewall"
sudo ufw default deny incoming >/dev/null
sudo ufw default allow outgoing >/dev/null
sudo ufw allow OpenSSH >/dev/null
sudo ufw allow 80/tcp   >/dev/null
sudo ufw allow 443/tcp  >/dev/null
sudo ufw --force enable >/dev/null
success "ufw active — default deny in, 22/80/443 open"

step "Enabling unattended security upgrades"
sudo dpkg-reconfigure -f noninteractive unattended-upgrades >/dev/null 2>&1 || warn "already configured"
success "security updates will install automatically"

banner "Provisioning Complete ✔" 2
gum style --bold "Still to do by hand (these need secrets or data):"
echo -e "  1. Create the four .env files from the !.env templates"
echo -e "  2. Copy backend/directus/data.db and backend/directus/uploads/"
echo -e "  3. ./scripts/deploy.sh --install"
echo -e "  4. ./scripts/cron.sh --enable"
echo -e "  5. ./scripts/harden-ssh.sh"
echo ""
