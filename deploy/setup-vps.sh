#!/usr/bin/env bash
#
# One-time Hostinger VPS setup.
#
# Prepares a fresh Ubuntu VPS to receive deploys from GitLab CI. Run it once,
# as a user with sudo, on the server itself:
#
#   curl -fsSL <raw-url>/deploy/setup-vps.sh -o setup-vps.sh
#   less setup-vps.sh          # read it before running it
#   sudo bash setup-vps.sh
#
# It is idempotent — re-running is safe and will not duplicate anything.
#
# What it deliberately does NOT do:
#   - write any secret (you create .env by hand afterwards)
#   - obtain a TLS certificate (certbot needs DNS pointed at the box first)
#   - open a password-authenticated SSH login

set -euo pipefail

NODE_MAJOR="${NODE_MAJOR:-22}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/portfolio}"

log() { printf '\n\033[1;36m==>\033[0m %s\n' "$1"; }

if [[ $EUID -ne 0 ]]; then
  echo "Run this with sudo." >&2
  exit 1
fi

# -----------------------------------------------------------------------------
log "System packages"
# -----------------------------------------------------------------------------
apt-get update -qq
apt-get install -y -qq curl ca-certificates gnupg rsync ufw nginx git

# -----------------------------------------------------------------------------
log "Node.js ${NODE_MAJOR}"
# -----------------------------------------------------------------------------
# NodeSource rather than Ubuntu's repository, which lags several major versions
# behind. The Node major here must match NODE_VERSION in .gitlab-ci.yml.
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v${NODE_MAJOR}* ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi
node -v

# -----------------------------------------------------------------------------
log "PM2"
# -----------------------------------------------------------------------------
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

# -----------------------------------------------------------------------------
log "Deploy user"
# -----------------------------------------------------------------------------
# A dedicated unprivileged user. CI logs in as this account, so a compromised
# deploy key does not hand over root.
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi

install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 700 "/home/$DEPLOY_USER/.ssh"
touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"

# -----------------------------------------------------------------------------
log "Directory layout at $DEPLOY_PATH"
# -----------------------------------------------------------------------------
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$DEPLOY_PATH"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$DEPLOY_PATH/releases"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$DEPLOY_PATH/logs"
install -d -o www-data -g www-data -m 755 /var/www/certbot

# Runtime secrets. Created empty and locked down; you fill it in by hand.
if [[ ! -f "$DEPLOY_PATH/.env" ]]; then
  install -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 600 /dev/null "$DEPLOY_PATH/.env"
fi

# -----------------------------------------------------------------------------
log "Firewall"
# -----------------------------------------------------------------------------
# Port 3000 is intentionally absent: the Node process binds to 127.0.0.1 and is
# reachable only through Nginx. Exposing it would bypass TLS and rate limiting.
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable
ufw status verbose

# -----------------------------------------------------------------------------
log "PM2 startup on boot"
# -----------------------------------------------------------------------------
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$DEPLOY_USER" \
  --hp "/home/$DEPLOY_USER" >/dev/null

cat <<EOF

  Setup complete. Remaining manual steps, in order:

  1. Add the CI deploy key:
       sudo -u $DEPLOY_USER nano /home/$DEPLOY_USER/.ssh/authorized_keys

  2. Copy the process definition and the Nginx site from the repo:
       scp deploy/ecosystem.config.cjs $DEPLOY_USER@<host>:$DEPLOY_PATH/
       scp deploy/nginx.conf root@<host>:/etc/nginx/sites-available/portfolio

  3. Fill in runtime secrets (chmod 600 already applied):
       sudo -u $DEPLOY_USER nano $DEPLOY_PATH/.env

  4. Point DNS at this server, then enable the site and get a certificate:
       ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
       rm -f /etc/nginx/sites-enabled/default
       nginx -t && systemctl reload nginx
       apt-get install -y certbot python3-certbot-nginx
       certbot --nginx -d example.com -d www.example.com

  5. Run the deploy job in GitLab. On the first successful deploy:
       sudo -u $DEPLOY_USER pm2 save

EOF
