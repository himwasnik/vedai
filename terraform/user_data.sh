#!/bin/bash
set -e

echo "=== Starting VedAI Deployment ==="

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt-get install -y git

# Clone repository
cd /home/ubuntu
git clone https://github.com/himwasnik/vedai.git
cd vedai

# Create .env file from .env.example
cp apps/api/.env.example apps/api/.env

# Extract Anthropic key from .env.example if not provided
if [ -z "${anthropic_key}" ]; then
  echo "Extracting Anthropic key from .env.example..."
  EXTRACTED_KEY=$(grep "ANTHROPIC_API_KEY=" apps/api/.env.example | cut -d'=' -f2 | xargs)
  if [ ! -z "$EXTRACTED_KEY" ] && [ "$EXTRACTED_KEY" != "sk-ant-xxx" ]; then
    anthropic_key="$EXTRACTED_KEY"
    echo "Using extracted key from .env.example"
  fi
fi

# Set environment variables in .env
cat >> apps/api/.env << EOF

# AWS Configuration
AWS_REGION=${aws_region}
AWS_ACCESS_KEY_ID=$${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=$${AWS_SECRET_ACCESS_KEY:-}

# Anthropic API Key (extracted from repo)
ANTHROPIC_API_KEY=$${anthropic_key}
EOF

# Create .env.local for docker-compose override (for EC2 IP-based access)
cat > .env.local << EOF
# Frontend API URL - use EC2 IP for external access
NEXT_PUBLIC_API_URL=http://$(hostname -I | awk '{print $1}'):5000
EOF

# Fix permissions
chown -R ubuntu:ubuntu /home/ubuntu/vedai

# Start Docker containers
cd /home/ubuntu/vedai
sudo -u ubuntu docker-compose up -d --build

echo "=== VedAI Deployment Complete ==="
echo "Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "Backend API: http://$(hostname -I | awk '{print $1}'):5000"
