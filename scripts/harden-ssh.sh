#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

#
# Disable SSH password auth and root login.
#

KEYFILE="$HOME/.ssh/authorized_keys"

banner "Hardening SSH on $(hostname)"

[[ -s "$KEYFILE" ]] || fail "no keys in $KEYFILE — add your public key first"
[[ -t 0 ]] || fail "needs an interactive terminal"

gum style --bold "Keys currently authorised for $USER:"
ssh-keygen -lf "$KEYFILE" | sed 's/^/    /'
echo ""

gum confirm "Is one of these yours, and can you log in with it right now?" \
  || { warn "aborted — password auth left enabled"; exit 0; }

sudo tee /etc/ssh/sshd_config.d/99-hardening.conf >/dev/null <<'SSHD'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
SSHD

sudo sshd -t || { sudo rm -f /etc/ssh/sshd_config.d/99-hardening.conf; fail "sshd config test"; }
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd || fail "reload ssh"

success "password auth and root login disabled"
warn "keep this session open until you have confirmed a new key login works"
