#!/bin/bash

# Logging setup
LOG_FILE="/var/log/vedai-deployment.log"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error_exit() {
  log "ERROR: $*"
  exit 1
}

log "=== Starting VedAI Deployment ==="

# Set strict mode
set -e
trap "error_exit 'Script failed at line $LINENO'" ERR

# Get instance private IP
PRIVATE_IP=$(hostname -I | awk '{print $1}')
log "Instance IP: $PRIVATE_IP"

# ============================================================================
# System Updates
# ============================================================================
log "Updating system packages..."
apt-get update || error_exit "apt-get update failed"
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y || error_exit "apt-get upgrade failed"
apt-get install -y curl git jq || error_exit "Failed to install dependencies"

# ============================================================================
# Docker Installation & Setup
# ============================================================================
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh || error_exit "Failed to download Docker installer"
  sh get-docker.sh || error_exit "Docker installation failed"
  rm -f get-docker.sh
fi

# Add ubuntu user to docker group
usermod -aG docker ubuntu || error_exit "Failed to add ubuntu to docker group"

# Create docker systemd group for ubuntu user (fixes socket permissions)
log "Configuring docker socket permissions..."
install -o root -g docker -m 750 -d /run/docker.sock.d 2>/dev/null || true

# ============================================================================
# Docker Compose Installation
# ============================================================================
log "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
  COMPOSE_URL="https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)"
  
  curl -L "$COMPOSE_URL" -o /usr/local/bin/docker-compose || error_exit "Failed to download Docker Compose"
  chmod +x /usr/local/bin/docker-compose || error_exit "Failed to make Docker Compose executable"
fi

# Verify Docker and Docker Compose installation
log "Verifying Docker installation..."
docker --version || error_exit "Docker verification failed"
docker-compose --version || error_exit "Docker Compose verification failed"

# ============================================================================
# Repository Setup
# ============================================================================
REPO_DIR="/home/ubuntu/vedai"
log "Setting up repository..."

if [ -d "$REPO_DIR" ]; then
  log "Repository already exists, pulling latest changes..."
  cd "$REPO_DIR"
  git pull origin main || log "WARNING: git pull failed, continuing with existing repo"
else
  log "Cloning repository..."
  git clone https://github.com/himwasnik/vedai.git "$REPO_DIR" || error_exit "Failed to clone repository"
  cd "$REPO_DIR"
fi

# ============================================================================
# Environment Configuration
# ============================================================================
log "Configuring environment variables..."

# Verify required files exist
[ -f "apps/api/.env.example" ] || error_exit ".env.example not found in apps/api"
[ -f "docker-compose.yml" ] || error_exit "docker-compose.yml not found"

# Create .env file from template
cp apps/api/.env.example apps/api/.env || error_exit "Failed to copy .env.example"

# Extract Anthropic key
ANTHROPIC_KEY="${anthropic_key}"
if [ -z "$ANTHROPIC_KEY" ]; then
  log "Extracting Anthropic key from .env.example..."
  EXTRACTED_KEY=$(grep "ANTHROPIC_API_KEY=" apps/api/.env.example | cut -d'=' -f2 | xargs)
  if [ ! -z "$EXTRACTED_KEY" ] && [ "$EXTRACTED_KEY" != "sk-ant-xxx" ]; then
    ANTHROPIC_KEY="$EXTRACTED_KEY"
    log "Using extracted key from .env.example"
  else
    log "WARNING: No valid Anthropic key found"
  fi
fi

# Append configuration to .env
cat >> apps/api/.env << EOF

# AWS Configuration
AWS_REGION=${aws_region}
AWS_ACCESS_KEY_ID=$${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=$${AWS_SECRET_ACCESS_KEY:-}

# Anthropic API Key
ANTHROPIC_API_KEY=$ANTHROPIC_KEY

# Environment
NODE_ENV=production
EOF

# Create docker-compose override for EC2 IP-based access
cat > .env.local << EOF
# Frontend API URL - use EC2 private IP for internal access
NEXT_PUBLIC_API_URL=http://$PRIVATE_IP:5000

# Docker configuration
COMPOSE_PROJECT_NAME=vedai
EOF

log "Environment configuration complete"

# ============================================================================
# Fix Permissions
# ============================================================================
log "Setting up permissions..."
chown -R ubuntu:ubuntu "$REPO_DIR" || error_exit "Failed to set directory permissions"
chmod 755 "$REPO_DIR" || error_exit "Failed to set directory mode"

# ============================================================================
# Start Services
# ============================================================================
log "Starting Docker containers..."
cd "$REPO_DIR"

# Start docker daemon service if not running
service docker start || log "WARNING: Docker service start issued"

# Give docker group time to be active
sleep 2

# Start containers using docker-compose (run as root since sudo already running)
docker-compose down 2>/dev/null || true
docker-compose up -d --build || error_exit "docker-compose up failed"

log "Waiting for services to be ready (60 seconds)..."
sleep 60

# ============================================================================
# Health Checks
# ============================================================================
log "Performing health checks..."

MAX_ATTEMPTS=10
ATTEMPT=1

check_api_health() {
  curl -s -f http://localhost:5000/health >/dev/null 2>&1
  return $?
}

check_web_health() {
  curl -s -f http://localhost:3000 >/dev/null 2>&1
  return $?
}

log "Checking API health..."
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  if check_api_health; then
    log "✓ API is healthy"
    break
  else
    log "API health check attempt $ATTEMPT/$MAX_ATTEMPTS failed, retrying in 10s..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
  fi
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
  log "ERROR: API failed health check after $MAX_ATTEMPTS attempts"
  log "Docker container status:"
  docker-compose ps
  docker-compose logs --tail=50 api
  error_exit "API health check failed"
fi

ATTEMPT=1
log "Checking Web UI health..."
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  if check_web_health; then
    log "✓ Web UI is healthy"
    break
  else
    log "Web health check attempt $ATTEMPT/$MAX_ATTEMPTS failed, retrying in 10s..."
    sleep 10
    ATTEMPT=$((ATTEMPT + 1))
  fi
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
  log "WARNING: Web UI failed health check after $MAX_ATTEMPTS attempts"
  log "Docker container status:"
  docker-compose ps
  docker-compose logs --tail=50 web
fi

# ============================================================================
# Verify Deployment
# ============================================================================
log "Verifying deployment..."
docker-compose ps || error_exit "Failed to get container status"

# ============================================================================
# Deployment Complete
# ============================================================================
log "=== VedAI Deployment Complete ==="
log "Frontend URL: http://$PRIVATE_IP:3000"
log "Backend API: http://$PRIVATE_IP:5000"
log "Logs: tail -f $LOG_FILE"
log ""
log "Container Status:"
docker-compose ps
