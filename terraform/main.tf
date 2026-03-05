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

# VPC
resource "aws_vpc" "vedai" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vedai-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "vedai" {
  vpc_id = aws_vpc.vedai.id

  tags = {
    Name = "vedai-igw"
  }
}

# Subnet
resource "aws_subnet" "vedai" {
  vpc_id                  = aws_vpc.vedai.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "vedai-subnet"
  }
}

# Route Table
resource "aws_route_table" "vedai" {
  vpc_id = aws_vpc.vedai.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.vedai.id
  }

  tags = {
    Name = "vedai-rt"
  }
}

# Route table association
resource "aws_route_table_association" "vedai" {
  subnet_id      = aws_subnet.vedai.id
  route_table_id = aws_route_table.vedai.id
}

# Get available AZs
data "aws_availability_zones" "available" {
  state = "available"
}

# Security Group
resource "aws_security_group" "vedai" {
  name        = "vedai-sg"
  description = "Security group for VedAI application"
  vpc_id      = aws_vpc.vedai.id

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

# Get default VPC
data "aws_vpc" "default" {
  default = true
}

# Get first available subnet in default VPC
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# EC2 Instance
resource "aws_instance" "vedai" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.vedai.id
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
  domain = "vpc"

  tags = {
    Name = "vedai-eip"
  }

  depends_on = [aws_internet_gateway.vedai]
}

# Associate Elastic IP with instance
resource "aws_eip_association" "vedai" {
  instance_id   = aws_instance.vedai.id
  allocation_id = aws_eip.vedai.id
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
