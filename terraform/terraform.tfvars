# AWS Configuration
aws_region    = "ap-south-1"      # Change if needed (us-east-1, eu-west-1, etc)
instance_type = "t2.micro"        # Free tier eligible, or use t2.small for better performance
key_pair_name = "vedai-key"       # Your AWS EC2 key pair name (see instructions below)

# Anthropic API Key - REPLACE WITH YOUR ACTUAL KEY FROM CONSOLE.ANTHROPIC.COM
anthropic_key = "sk-ant-your-api-key-here"  # Get from https://console.anthropic.com/

# Optional
root_volume_size = 30             # GB
