# Setup Guide for VedAI Terraform Deployment

## Step 1: Get Anthropic API Key

**This key is already in your `.env.example` file!**

Follow these steps:

1. Go to: https://console.anthropic.com/
2. Sign up (FREE - includes $5 credit!)
3. Click "API Keys" in the left menu
4. Click "Create Key" button
5. Copy the key (looks like: `sk-ant-abc123xyz...`)
6. Paste it into `terraform/terraform.tfvars` replacing `"sk-ant-your-api-key-here"`

**Example:**
```
anthropic_key = "sk-ant-xgV7KRe4rT9mP2qL5wA8bC1dE3fG6hJ9k"
```

---

## Step 2: Create AWS EC2 Key Pair

Your computer needs a **key pair** to SSH into the EC2 instance. There are two options:

### Option A: Create via AWS Console (Easiest)

1. Go to: https://console.aws.amazon.com/
2. Login to your AWS account
3. Search for "EC2" → Click "EC2"
4. In left menu: **Key Pairs** (or **Network & Security** → **Key Pairs**)
5. Click **Create Key Pair**
6. **Name:** `vedai-key`
7. **Key file format:** `.pem` (for Mac/Linux) or `.ppk` (for Windows PuTTY)
8. Click **Create**
9. A file downloads automatically (e.g., `vedai-key.pem`)
10. Move it to safe location: `C:\Users\himwa\.ssh\vedai-key.pem`
11. Change permissions:
    ```powershell
    icacls "C:\Users\himwa\.ssh\vedai-key.pem" /inheritance:r /grant:r "%username%:R"
    ```

### Option B: Create via AWS CLI

```bash
# List existing key pairs
aws ec2 describe-key-pairs --region ap-south-1

# Create new key pair
aws ec2 create-key-pair --key-name vedai-key --query 'KeyMaterial' --output text > vedai-key.pem

# Set permissions
icacls vedai-key.pem /inheritance:r /grant:r "%username%:R"
```

---

## Step 3: Update terraform.tfvars

Edit `terraform/terraform.tfvars`:

```hcl
# AWS Configuration
aws_region      = "ap-south-1"           # Your AWS region
instance_type   = "t2.micro"             # Free tier
key_pair_name   = "vedai-key"            # Match your AWS key pair name

# Anthropic API Key - PASTE YOUR KEY HERE
anthropic_key   = "sk-ant-YOUR-ACTUAL-KEY-HERE"

root_volume_size = 30
```

---

## Step 4: Deploy with Terraform

```bash
# Navigate to terraform folder
cd terraform

# Initialize Terraform
terraform init

# Check what will be created
terraform plan

# Deploy!
terraform apply
```

**Outputs will show:**
```
Frontend URL: http://1.2.3.4:3000
Backend API: http://1.2.3.4:5000
SSH Command: ssh -i C:\path\to\vedai-key.pem ubuntu@1.2.3.4
```

---

## Step 5: Access Your App

1. **Frontend:** Open browser → `http://<PUBLIC_IP>:3000`
2. **Backend API:** `http://<PUBLIC_IP>:5000`
3. **SSH:** `ssh -i vedai-key.pem ubuntu@<PUBLIC_IP>`

---

## Troubleshooting

### "Key pair not found" error
- Make sure key pair name in terraform.tfvars matches exactly what you created in AWS
- Verify in AWS Console → EC2 → Key Pairs

### Can't SSH into instance
```bash
# Wait 2-3 minutes for instance to boot
# Then try:
ssh -i vedai-key.pem ubuntu@<PUBLIC_IP>

# If still fails, check:
# 1. Key pair name is correct
# 2. Security group allows port 22
# 3. Instance is running (check AWS Console)
```

### "Anthropic API key invalid"
- Get your actual key from https://console.anthropic.com/
- Make sure it starts with `sk-ant-`
- Paste it in terraform.tfvars (no extra spaces)

---

## Summary

1. ✅ Get Anthropic key from console.anthropic.com
2. ✅ Create EC2 key pair named `vedai-key` in AWS
3. ✅ Update terraform/terraform.tfvars with both keys
4. ✅ Run `terraform init` then `terraform apply`
5. ✅ Wait 3-5 minutes for setup
6. ✅ Access at public IP from outputs

