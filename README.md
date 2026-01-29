# 🌟 VedAI - AI Astrology Platform

Complete AI-powered Vedic astrology platform with AWS Bedrock integration, Kundli analysis, and gemstone e-commerce.

![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock%20AI-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

- 🤖 **AI Astrology Chat** - Powered by Anthropic Claude API (Claude 3 Haiku - cheapest model)
- 🔮 **Kundli Analysis** - Complete Vedic birth chart analysis with AI
- 💎 **Gemstone Store** - E-commerce for spiritual products
- ✨ **Smart Recommendations** - AI suggests gemstones based on chat & Kundli
- 📱 **Responsive Design** - Works on all devices
- 📊 **Simple Database** - JSON files (easy to migrate later)
- ⚡ **Works Offline** - Fallback responses if no API key

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

### 2. AWS Credentials Already Set Up!
Your `test_anthropic_api.js` works, so AWS credentials are already configured!

No need to add anything - the app uses AWS credential chain automatically.

**Note:** If AI doesn't work, app will use fallback responses

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

## 🤖 Anthropic API Setup

### Why Anthropic?
- **Cheapest Claude Model**: Claude 3 Haiku (~$0.25/$1.25 per 1M tokens)
- **Cost**: ~$0.50-2/month for typical usage
- **Quality**: Excellent responses for astrology and Kundli analysis
- **Free Credit**: $5 free for new users

### Setup Steps

1. **Create Anthropic Account**
   - Go to https://console.anthropic.com/
   - Sign up (FREE $5 credit!)

2. **Get API Key**
   - Console → API Keys
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-...`)

3. **Add to Your App**
   ```bash
   cd apps/api
   echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
   ```

4. **Restart Backend**
   ```bash
   npm start
   ```

Done! Now chat and Kundli will use real AI!

### Without API Key
No problem! App uses intelligent fallback responses for:
- Career, love, health, wealth guidance
- Gemstone recommendations
- Basic Kundli analysis

## 📁 Project Structure

```
vedai/
├── apps/
│   ├── api/                      # Backend (Node.js/Express)
│   │   ├── simple-server.js      # Main server
│   │   ├── anthropic-service.js  # Anthropic AI integration
│   │   ├── database.js           # JSON database
│   │   ├── data/                 # Data storage (auto-created)
│   │   ├── .env                  # Your API key (gitignored)
│   │   └── package.json          # Only 4 dependencies!
│   └── web/                      # Frontend (Next.js 14)
│       ├── app/
│       │   ├── page.tsx          # Home
│       │   ├── chat/             # Chat + Kundli form
│       │   ├── shop/             # Store
│       │   └── admin/            # Admin dashboard
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

**With Anthropic API:**
- Claude 3 Haiku: $0.25 per 1M input tokens, $1.25 per 1M output tokens
- ~$0.50-2/month for typical usage (100-200 messages/day)
- **FREE $5 credit** for new users (lasts months!)

**Without API Key:**
- FREE! Uses intelligent fallback responses

**Hosting:**
- Backend: Free tier (Railway/Render)
- Frontend: Free (Vercel)

**Total:** FREE to start, <$2/month after credit

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
