# Combined Documentation for VedAI

## 1. Docker Setup

### 🚀 Quick Start

#### Prerequisites
- Docker Desktop installed
- Docker Compose installed (included with Docker Desktop)

#### Start Everything
```bash
# Build and start all services
docker-compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

#### Stop Everything
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

### 📋 Docker Commands

#### Basic Commands
```bash
# Start services (build if needed)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Build without starting
docker-compose build

# View logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs api
```

---

## 2. Quick Start Guide

### Simple Setup (No Database Required!)

#### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd apps/api
npm install express cors

# Install frontend dependencies
cd ../web
npm install

cd ../..
```

#### Step 2: Start the Backend Server

```bash
# From the vedai root directory
cd apps/api
node simple-server.js
```

You should see:
```
╔════════════════════════════════════════════════╗
║       VedAI Backend Server Started            ║
╠════════════════════════════════════════════════╣
║  Port: 5000                                   ║
║  Status: ✓ Running                            ║
║  API: http://localhost:5000                   ║
╚════════════════════════════════════════════════╝
```

#### Step 3: Start the Frontend (New Terminal)

```bash
# Open a new terminal, from vedai root
cd apps/web
npm run dev
```

The app will start at: **http://localhost:3000**

#### Step 4: Use the App

---

## 3. Simple Production Setup

**No Redis. No PostgreSQL. No AWS. No Complexity.**

Just a simple, working AI astrology platform with chat and shop!

### 🚀 Quick Start (3 Steps)

#### Step 1: Install Dependencies

```bash
# Backend
cd apps/api
npm install

# Frontend
cd ../web
npm install
```

#### Step 2: Start Backend

```bash
cd apps/api
npm start
```

Server starts on **http://localhost:5000**

#### Step 3: Start Frontend (New Terminal)

```bash
cd apps/web
npm run dev
```

App opens at **http://localhost:3000**

That's it! 🎉

---

## 4. Complete Setup Guide

### ✨ What You Have

A production-ready AI astrology platform with:
- 🤖 Beautiful AI chat interface
- 💎 E-commerce gemstone store
- ✨ Smart product recommendations
- 📱 Fully responsive design
- 🐳 Docker support
- 📊 Simple JSON database
- ⚡ Zero complexity

### 🎯 Choose Your Setup Method

#### Option 1: Docker (Recommended for Production)

**Easiest way to run everything:**

```bash
# Start everything with one command
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

See [DOCKER-SETUP.md](DOCKER-SETUP.md) for full Docker guide.

---

#### Option 2: NPM (Recommended for Development)

**Manual setup for development:**

**Terminal 1 - Backend:**
```bash
cd apps/api
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

---

## 5. Setup Complete

### 🎉 What's Been Done

#### ✅ Simplified Architecture
- ❌ Removed Redis, PostgreSQL, Prisma, Docker
- ✅ Added simple JSON file-based database
- ✅ Only 2 backend dependencies (express + cors)
- ✅ Clean, production-ready code

#### ✅ Beautiful UI Created
1. **Enhanced Chat Page** (`/chat`)
   - WhatsApp-style messaging
   - Quick reply buttons
   - AI product recommendations inline
   - Typing indicators
   - Smooth animations
   - Online status indicator

2. **Enhanced Shop Page** (`/shop`)
   - Hero banner with CTA
   - Advanced search & filters
   - Sort by price, rating, popularity
   - Grid view options (3 sizes)
   - Category pills with counts
   - Beautiful product cards
   - Empty state handling

3. **Updated Home Page** (`/`)
   - Clear navigation
   - Call-to-action buttons
   - Feature showcase
   - Modern gradient design

#### ✅ Simple Backend API
- File: `apps/api/simple-server.js`
- Database: `apps/api/database.js`
- Features:
  - AI chat with smart responses
  - Product recommendations
  - Shopping cart
  - Health check endpoint
  - CORS enabled
  - Error handling

#### ✅ AI Features
- Understands 7+ topic categories
- Smart product suggestions
- Context-aware responses
- No external API needed (works offline!)

---

## 6. Start VedAI in 2 Minutes!

### Option 1: One Command (Recommended)

```bash
# Install dependencies for both backend and frontend
npm run install:all

# Start both servers
npm run dev
```

Done! Open **http://localhost:3000** in your browser.

---

### Option 2: Step by Step

#### Terminal 1 - Backend:
```bash
cd apps/api
npm install
npm start
```

#### Terminal 2 - Frontend:
```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:3000**

---

### ✅ What You'll See

- **Home Page**: Click "Talk to AI Astrologer" or "Browse Store"
- **Chat Page**: Ask about career, love, health, wealth
- **Shop Page**: Browse gemstones and spiritual products

---

### 💬 Try These Questions in Chat

- "I'm looking for career guidance"
- "What gemstone helps with stress?"
- "I want to improve my financial situation"
- "Recommend gemstones for love and relationships"
