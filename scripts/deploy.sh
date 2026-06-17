#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Script de déploiement initial sur serveur VPS Ubuntu 22 LTS
# Usage : sudo bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/opt/imaz"
DOMAIN="${DOMAIN:-imaz.bf}"
REPO_URL="${REPO_URL:-https://github.com/boubas2024-source/claude-init.git}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

# ── 1. Prérequis système ──────────────────────────────────────────────────────
log "Installation des prérequis..."
apt-get update -qq
apt-get install -y -qq \
  curl git ufw fail2ban \
  ca-certificates gnupg lsb-release

# Docker
if ! command -v docker &>/dev/null; then
  log "Installation de Docker..."
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker ubuntu || true
fi

# Docker Compose plugin
if ! docker compose version &>/dev/null; then
  log "Installation de Docker Compose..."
  COMPOSE_VER=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d'"' -f4)
  curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VER}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

# ── 2. Firewall ───────────────────────────────────────────────────────────────
log "Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── 3. Cloner / mettre à jour le dépôt ───────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  log "Mise à jour du dépôt..."
  git -C "$APP_DIR" pull origin main
else
  log "Clonage du dépôt..."
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# ── 4. Variables d'environnement ──────────────────────────────────────────────
if [ ! -f .env ]; then
  warn ".env introuvable — copie depuis .env.example"
  cp .env.example .env
  # Générer des secrets aléatoires
  JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
  NEXTAUTH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
  POSTGRES_PASS=$(openssl rand -base64 32 | tr -d '\n')
  REDIS_PASS=$(openssl rand -base64 32 | tr -d '\n')

  sed -i "s|changeme_strong_password|${POSTGRES_PASS}|g" .env
  sed -i "s|changeme_redis_password|${REDIS_PASS}|g" .env
  sed -i "s|changeme_jwt_secret_at_least_32_chars_long|${JWT_SECRET}|g" .env
  sed -i "s|changeme_nextauth_secret_at_least_32_chars|${NEXTAUTH_SECRET}|g" .env
  sed -i "s|https://imaz.bf|https://${DOMAIN}|g" .env

  warn "⚠️  Éditez /opt/imaz/.env pour renseigner SMTP_PASS et FASO_SMS_API_KEY"
fi

# ── 5. Dossiers persistants ───────────────────────────────────────────────────
mkdir -p public/uploads && chmod 775 public/uploads

# ── 6. Build & démarrage ─────────────────────────────────────────────────────
log "Build et démarrage des conteneurs..."
docker compose pull --quiet
docker compose build app
docker compose up -d db redis
sleep 5

log "Application des migrations..."
docker compose run --rm app npx prisma migrate deploy

log "Démarrage de l'application et de Nginx..."
docker compose up -d

# ── 7. Certificat SSL (Let's Encrypt) ─────────────────────────────────────────
log "Génération du certificat SSL pour ${DOMAIN}..."
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "admin@${DOMAIN}" \
  --agree-tos --no-eff-email \
  -d "$DOMAIN" -d "www.${DOMAIN}" || \
  warn "Certificat SSL non généré — vérifiez que DNS ${DOMAIN} pointe vers ce serveur"

docker compose restart nginx

# ── 8. Seed initial ───────────────────────────────────────────────────────────
read -p "Charger les données de démonstration ? [y/N] " -n 1 -r REPLY
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  docker compose exec app npm run db:seed
  log "Données de démonstration chargées."
fi

# ── 9. Healthcheck ───────────────────────────────────────────────────────────
sleep 5
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health || echo "000")
if [ "$STATUS" = "200" ]; then
  log "✅ Déploiement réussi — https://${DOMAIN}"
else
  err "Healthcheck KO (HTTP $STATUS) — vérifiez : docker compose logs app"
fi

echo ""
echo "======================================================="
echo " IMAZ Platform déployée avec succès !"
echo "  URL       : https://${DOMAIN}"
echo "  Admin BO  : https://${DOMAIN}/backoffice/login"
echo "  Logs app  : docker compose -C ${APP_DIR} logs -f app"
echo "======================================================="
