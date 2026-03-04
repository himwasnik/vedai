terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security Group
resource "aws_security_group" "vedai" {
  name        = "vedai-sg"
  description = "Security group for VedAI application"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Frontend (port 3000)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API (port 5000)
  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vedai-sg"
  }
}

# EC2 Instance
resource "aws_instance" "vedai" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.vedai.id]
  
  # Allocate public IP
  associate_public_ip_address = true

  # Root volume
  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  # User data script to set up everything
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    anthropic_key = var.anthropic_key
    aws_region    = var.aws_region
  }))

  tags = {
    Name = "vedai-app"
  }

  depends_on = [aws_security_group.vedai]
}

# Get latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Elastic IP (optional but recommended)
resource "aws_eip" "vedai" {
  instance = aws_instance.vedai.id
  domain   = "vpc"

  tags = {
    Name = "vedai-eip"
  }

  depends_on = [aws_instance.vedai]
}

# Output the public IP
output "instance_public_ip" {
  description = "Public IP address of the VedAI instance"
  value       = aws_eip.vedai.public_ip
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_eip.vedai.public_ip}:3000"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.vedai.public_ip}:5000"
}

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.vedai.id
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i /path/to/your/key.pem ubuntu@${aws_eip.vedai.public_ip}"
}
