# VedAI Terraform Deployment

Complete Terraform configuration to deploy VedAI on AWS EC2.

## Prerequisites

1. **AWS Account** with credentials configured
   ```bash
   aws configure
   ```

2. **Terraform** installed (v1.0+)
   ```bash
   terraform --version
   ```

3. **EC2 Key Pair** created in AWS
   ```bash
   # Create in AWS Console or:
   aws ec2 create-key-pair --key-name vedai-key --query 'KeyMaterial' --output text > vedai-key.pem
   chmod 400 vedai-key.pem
   ```

4. **Anthropic API Key** from https://console.anthropic.com

## Deployment Steps

### 1. Prepare terraform.tfvars

Create `terraform/terraform.tfvars`:

```hcl
aws_region      = "ap-south-1"  # Change to your region
instance_type   = "t2.micro"    # Free tier eligible
key_pair_name   = "vedai-key"   # Your AWS key pair name
anthropic_key   = "sk-ant-..."  # Your Anthropic API key
```

### 2. Initialize Terraform

```bash
cd terraform
terraform init
```

### 3. Plan Deployment

```bash
terraform plan -out=tfplan
```

### 4. Apply Configuration

```bash
terraform apply tfplan
```

This will output:
- **instance_public_ip**: Public IP address
- **frontend_url**: Frontend access URL (port 3000)
- **backend_url**: Backend API URL (port 5000)
- **ssh_command**: How to SSH into the instance

### 5. Verify Deployment

```bash
# SSH into instance
ssh -i /path/to/vedai-key.pem ubuntu@<PUBLIC_IP>

# Check Docker containers
docker ps

# View logs
docker-compose logs -f
```

### 6. Access Your App

- **Frontend**: `http://<PUBLIC_IP>:3000`
- **Backend API**: `http://<PUBLIC_IP>:5000`

## Environment Variables Set

The following are automatically configured:

```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=<Your AWS Access Key>
AWS_SECRET_ACCESS_KEY=<Your AWS Secret Key>
ANTHROPIC_API_KEY=<Your Anthropic Key>
```

## Cleanup (Delete Resources)

```bash
terraform destroy
```

This will delete the EC2 instance and security group.

## Troubleshooting

### Port 22 (SSH) connection refused
- Wait 1-2 minutes for instance to fully boot
- Check security group allows 0.0.0.0/0 on port 22

### Docker containers not running
```bash
ssh -i vedai-key.pem ubuntu@<IP>
cd vedai
docker-compose logs
```

### Frontend can't reach API
- Check backend is running: `docker ps`
- Verify .env has correct API URL
- Check security group allows port 5000

### Anthropic API errors
- Verify API key is correct and has credits
- Check AWS IAM user has Bedrock permissions

## Cost

- **t2.micro**: ~$7/month (Free tier eligible for 12 months)
- **t2.small**: ~$15/month (recommended for better performance)
- **Data transfer**: ~$0.1/GB outbound
- **Elastic IP**: Free while instance is running

## Next Steps

1. Deploy with: `terraform apply`
2. Wait 3-5 minutes for full setup
3. Test at your public IP
4. Share the frontend URL with friends!

