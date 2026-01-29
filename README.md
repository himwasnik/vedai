# 🌟 VedAI - AI Astrology Platform

Complete AI-powered Vedic astrology platform with AWS Bedrock integration, Kundli analysis, and gemstone e-commerce.

![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock%20AI-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features


- 🤖 **AI Astrology Chat** - Powered by AWS Bedrock Claude Instant (cheapest model)
- 🔮 **Kundli Analysis** - Complete Vedic birth chart analysis with AI
- 💎 **Gemstone Store** - E-commerce for spiritual products
- ✨ **Smart Recommendations** - AI suggests gemstones based on chat & Kundli
- 📱 **Responsive Design** - Works on all devices
- 📊 **Simple Database** - JSON files (easy to migrate later)
- ⚡ **Works Offline** - Fallback responses if no AWS credentials

## 🚀 Quick Start (2 Minutes!)

### 1. Install Dependencies
```bash
# Backend
cd apps/api
npm install

# Frontend
cd ../web
npm install
```

### 2. (Optional) Configure AWS Bedrock
```bash
cd apps/api
cp .env.example .env
# Edit .env and add AWS credentials
```

**Note:** App works without AWS (uses fallback AI responses)

### 3. Start the App

**Terminal 1:**
```bash
cd apps/api
npm start
```

**Terminal 2:**
```bash
cd apps/web
npm run dev
```

**Open:** http://localhost:3000

## 📖 How to Use

### 1. AI Chat
- Go to http://localhost:3000/chat
- Click **💬 Chat** tab
- Ask: "I need career guidance", "Recommend gemstones for wealth"
- Get AI responses + product recommendations!

### 2. Kundli Analysis
- Go to http://localhost:3000/chat
- Click **🔮 Get Kundli** tab
- Fill birth details (name, date, time, place, gender)
- Get detailed AI-powered birth chart analysis!

### 3. Shop
- Go to http://localhost:3000/shop
- Browse 10+ products
- Search, filter, sort
- Add to cart

## 🤖 AWS Bedrock Setup (Optional)

### Why AWS Bedrock?
- **Cheapest AI**: `anthropic.claude-instant-v1`
- **Cost**: ~$0.80/$2.40 per 1M tokens (~$1-3/month for typical usage)
- **Quality**: Better responses than free alternatives

### Setup Steps

1. **Create AWS Account**
   - Go to https://aws.amazon.com/
   - Sign up (free tier available)

2. **Enable Bedrock**
   - AWS Console → Bedrock
   - Request access to `anthropic.claude-instant-v1`
   - Usually approved instantly

3. **Create IAM User**
   - IAM → Users → Create User
   - Attach policy: `AmazonBedrockFullAccess`
   - Create access key
   - Copy credentials

4. **Add Credentials**
   ```bash
   cd apps/api
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_here
   AWS_REGION=us-east-1
   ```

5. **Restart Backend**
   ```bash
   npm start
   ```

Done! Now AI will use AWS Bedrock for real intelligence.

### Without AWS Bedrock
No problem! App uses intelligent fallback responses for:
- Career, love, health, wealth guidance
- Gemstone recommendations
- Basic Kundli analysis

## 📁 Project Structure

```
vedai/
├── apps/
│   ├── api/                    # Backend (Node.js/Express)
│   │   ├── simple-server.js    # Main server
│   │   ├── bedrock-service.js  # AWS Bedrock integration
│   │   ├── database.js         # JSON database
│   │   ├── data/               # Data storage (auto-created)
│   │   ├── .env.example        # Environment template
│   │   └── package.json        # Only 4 dependencies!
│   └── web/                    # Frontend (Next.js 14)
│       ├── app/
│       │   ├── page.tsx        # Home
│       │   ├── chat/           # Chat + Kundli form
│       │   └── shop/           # Store
│       └── components/
├── docker-compose.yml
└── README.md
```

## 📡 API Endpoints

```
GET  /health                    # Health check
GET  /api/v1/products           # List all products
POST /api/v1/chat/message       # Chat with AI
POST /api/v1/kundli/analyze     # Analyze Kundli
POST /api/v1/cart/add           # Add to cart
GET  /api/v1/products/:slug     # Get product
```

### Examples

**Chat:**
```bash
curl -X POST http://localhost:5000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I need career success", "history": []}'
```

**Kundli:**
```bash
curl -X POST http://localhost:5000/api/v1/kundli/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "timeOfBirth": "10:30",
    "placeOfBirth": "Mumbai, India",
    "gender": "male"
  }'
```

## 🛒 Products

| Product | Price | Benefit |
|---------|-------|---------|
| Ruby | ₹15,000 | Sun - Leadership, vitality |
| Emerald | ₹12,000 | Mercury - Communication |
| Blue Sapphire | ₹25,000 | Saturn - Success |
| Pearl | ₹8,000 | Moon - Emotional balance |
| Yellow Sapphire | ₹18,000 | Jupiter - Wealth |
| Red Coral | ₹10,000 | Mars - Courage |
| Rudraksha | ₹500 | Well-being |
| Shri Yantra | ₹2,500 | Prosperity |
| Amethyst | ₹1,200 | Peace |
| Citrine | ₹1,500 | Success |

## 🎨 Customization

### Add Products
Edit `apps/api/simple-server.js`:
```javascript
const products = [
  {
    id: '11',
    slug: 'diamond',
    productName: 'Natural Diamond',
    price: 50000,
    category: 'gemstones',
    // ... more fields
  }
];
```

### Customize AI
Edit `generateAIResponse()` in `apps/api/simple-server.js`

## 🐳 Docker

```bash
docker-compose up --build
```

Access: http://localhost:3000

## 🚢 Deploy

### Backend
- Railway / Render / Heroku (free tiers available)
- Add AWS credentials as environment variables

### Frontend
- Vercel (recommended - free)
- Set `NEXT_PUBLIC_API_URL=your-backend-url`

## 📊 Database

JSON files in `apps/api/data/`:
- `users.json`
- `chats.json`
- `cart.json`
- `orders.json`

Backup: `node -e "require('./database').backup()"`

## ❓ Troubleshooting

**Backend won't start?**
```bash
cd apps/api
rm -rf node_modules
npm install
npm start
```

**Chat not working?**
- Check http://localhost:5000/health
- Verify backend is running
- Check browser console (F12)

**Kundli not working?**
- Works without AWS (uses fallback)
- Check AWS credentials if using Bedrock
- Verify all form fields filled

## 💰 Cost

**With AWS Bedrock:**
- ~$1-3/month for typical usage
- Pay only for what you use

**Without AWS:**
- FREE! Uses fallback responses

**Hosting:**
- Backend: Free tier (Railway/Render)
- Frontend: Free (Vercel)

## 📈 Future Features

- [ ] Admin dashboard
- [ ] Payment gateway
- [ ] User authentication
- [ ] Email notifications
- [ ] PDF Kundli reports
- [ ] Horoscope predictions

## 🎯 Commands

```bash
# Start both
npm run dev

# Backend only
cd apps/api && npm start

# Frontend only
cd apps/web && npm run dev

# Docker
docker-compose up

# Backup
cd apps/api && node -e "require('./database').backup()"
```

## 📄 License

MIT - Free for personal and commercial use

---

## ✅ Ready to Use!

1. **Install**: `cd apps/api && npm install && cd ../web && npm install`
2. **(Optional) AWS**: Add credentials to `apps/api/.env`
3. **Start Backend**: `cd apps/api && npm start`
4. **Start Frontend**: `cd apps/web && npm run dev`
5. **Visit**: http://localhost:3000

**Try the Chat and Kundli analysis!** 🎉

---

**Questions?** All code is well-commented. Check the source files for details!
