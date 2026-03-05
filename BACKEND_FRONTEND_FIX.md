# Backend-Frontend Connection Fix - Setup Guide

## Problem Identified
The connection between frontend and backend wasn't working on EC2 because:
1. **shop/page.tsx** had hardcoded `http://localhost:5000` URLs
2. **docker-compose.yml** hardcoded `NEXT_PUBLIC_API_URL=http://localhost:5000` 
3. Frontend containers couldn't reach backend using localhost on EC2 (localhost resolves to container's 127.0.0.1)
4. environment variables weren't being passed correctly to docker containers

## Solution Implemented

### 1. Smart Runtime API URL Detection
Updated all frontend pages to detect the API URL at runtime:
- **shop/page.tsx** - Now uses `getApiUrl()` helper function
- **chat/page.tsx** - Updated with smart hostname detection
- **admin/page.tsx** - Consistent API URL handling

**How it works:**
- Frontend automatically detects which hostname it's running on
- Assumes backend is on the same host but port 5000
- Examples:
  - Accessing `http://localhost:3000` → API calls to `http://localhost:5000`
  - Accessing `http://192.168.1.100:3000` → API calls to `http://192.168.1.100:5000`
  - Accessing `http://ec2-ip:3000` → API calls to `http://ec2-ip:5000`

### 2. docker-compose.yml Updates
- Removed hardcoded `NEXT_PUBLIC_API_URL` from web service
- Frontend now auto-detects API URL at runtime
- Simplified environment configuration

### 3. user_data.sh Updates
- Creates proper .env.local file for docker-compose values
- Correctly sets AWS region and API keys
- Uses `hostname -I` to determine EC2 IP address

### 4. Added .env.example
- Documents how to optionally set `NEXT_PUBLIC_API_URL` at build time
- Explains the auto-detection fallback behavior

## How to Deploy

### Local Development (Localhost)
```bash
docker-compose up -d --build
# Access: http://localhost:3000
# API automatically calls: http://localhost:5000
```

### EC2 Deployment with Terraform
```bash
# Configure AWS credentials
aws configure

# Deploy
cd terraform
terraform apply

# Terraform will:
# 1. Launch EC2 instance
# 2. Run user_data.sh to install Docker and deploy containers
# 3. Display the public IP address
```

After deployment, access your application at:
```
Frontend: http://<ec2-public-ip>:3000
API: http://<ec2-public-ip>:5000
```

## Testing the Connection

### 1. Check if containers are running
```bash
docker-compose ps
# Should show both vedai-api and vedai-web running
```

### 2. Test backend API directly
```bash
# From any machine with access to your EC2 instance
curl http://<ec2-ip>:5000/api/v1/products

# Should return product list
```

### 3. Test frontend
- Open browser: `http://<ec2-ip>:3000`
- Navigate to Shop page - products should load
- Check browser console (F12) for any errors

## Important Notes

1. **CORS is enabled** - Backend accepts requests from any origin
2. **Both frontend and backend must be accessible on the same IP** - This is now automatic since frontend detects its own hostname
3. **Environment variables** - If you need to override the API URL, set `NEXT_PUBLIC_API_URL` during build time
4. **Security Groups** - EC2 security group opens ports 3000 (frontend) and 5000 (API)

## Troubleshooting

### Frontend loads but API calls fail
- Verify both containers are running: `docker-compose ps`
- Check backend is listening: `curl http://localhost:5000/health`
- Check browser console for actual error messages

### TypeError: Cannot read property 'hostname' of undefined
- This means the code is running outside browser context (on server during build)
- The fallback to `http://localhost:5000` will be used during build
- At runtime in browser, it will auto-detect correctly

### CORS errors
- Backend already has CORS enabled
- If issues persist, check browser console for specific errors
- Verify API endpoint is returning valid JSON

## Optional: Custom API URL

If you need to use a custom API URL (e.g., ngrok tunnel, different domain):

1. Set during build time:
```bash
NEXT_PUBLIC_API_URL=https://your-custom-url.com docker-compose build web
```

2. Or create `.env` file in web directory:
```
NEXT_PUBLIC_API_URL=https://your-custom-url.com
```

Then rebuild and restart containers.
