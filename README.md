# 🌟 VedAI - AI Astrology Platform

A simple, production-ready AI astrology platform with gemstone e-commerce. No database complexity, no Redis, no Docker - just works!

![VedAI](https://img.shields.io/badge/VedAI-AI%20Astrology-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🤖 **AI Astrology Chat** - Interactive chat with intelligent astrology responses
- 💎 **Gemstone Store** - Beautiful e-commerce for spiritual products
- ✨ **Smart Recommendations** - AI suggests products based on user conversations
- 🔍 **Search & Filter** - Advanced product filtering and sorting
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Zero Complexity** - No database, Redis, or AWS required

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# 1. Install dependencies
cd apps/api
npm install

cd ../web
npm install
```

### Running the App

**Option 1: One Command (Easy)**
```bash
# From project root
npm run dev
```

**Option 2: Manual (Two Terminals)**

Terminal 1 - Backend:
```bash
cd apps/api
npm start
```

Terminal 2 - Frontend:
```bash
cd apps/web
npm run dev
```

### Access the App

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend**: http://localhost:5000

## 📁 Project Structure

```
vedai/
├── apps/
│   ├── api/
│   │   ├── simple-server.js    # Backend server (1 file!)
│   │   ├── database.js         # JSON file database
│   │   ├── data/               # Data storage (auto-created)
│   │   └── package.json        # Only 2 dependencies
│   └── web/
│       ├── app/
│       │   ├── page.tsx        # Home page
│       │   ├── chat/           # AI Chat interface
│       │   └── shop/           # Product store
│       └── components/
│           └── store/          # Product components
├── START-HERE.md               # Quick start guide
├── README-SIMPLE.md            # Detailed setup
└── package.json                # Root scripts
```

## 🎯 How It Works

### 1. Home Page
Beautiful landing page with clear call-to-action buttons for Chat and Shop.

### 2. AI Chat
- Ask questions about career, love, health, wealth
- Get instant AI responses with astrological guidance
- Receive personalized gemstone recommendations
- Beautiful WhatsApp-style interface

### 3. Shop
- Browse 10+ gemstones, rudraksha, yantras, and crystals
- Advanced search and filtering
- Sort by price, rating, or popularity
- Grid view options (small/medium/large)
- Add to cart functionality

## 💬 AI Chat Topics

The AI understands and provides guidance on:

| Category | Keywords |
|----------|----------|
| **Career & Business** | job, career, business, professional growth |
| **Love & Relationships** | love, marriage, relationships, compatibility |
| **Health & Wellness** | health, disease, wellness, mental health |
| **Wealth & Prosperity** | money, financial, prosperity, wealth |
| **Protection** | negative energy, evil eye, protection |
| **Peace & Stress** | stress, anxiety, calm, peace |
| **Gemstones** | recommendation, gemstone, stone |

## 🛒 Products Included

| Product | Price | Category |
|---------|-------|----------|
| Ruby (Manikya) | ₹15,000 | Gemstones |
| Emerald (Panna) | ₹12,000 | Gemstones |
| Blue Sapphire (Neelam) | ₹25,000 | Gemstones |
| Pearl (Moti) | ₹8,000 | Gemstones |
| Yellow Sapphire (Pukhraj) | ₹18,000 | Gemstones |
| Red Coral (Moonga) | ₹10,000 | Gemstones |
| 5 Mukhi Rudraksha | ₹500 | Rudraksha |
| Shri Yantra | ₹2,500 | Yantras |
| Amethyst Crystal | ₹1,200 | Crystals |
| Citrine Crystal | ₹1,500 | Crystals |

## 🔧 Configuration

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📡 API Endpoints

```
GET  /health                    # Health check
GET  /api/v1/products           # List all products
POST /api/v1/chat/message       # Send chat message
POST /api/v1/cart/add           # Add item to cart
GET  /api/v1/products/:slug     # Get product details
```

### Example API Usage

**Chat with AI:**
```bash
curl -X POST http://localhost:5000/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help with my career",
    "history": []
  }'
```

**Get Products:**
```bash
curl http://localhost:5000/api/v1/products
```

## 🎨 Customization

### Add More Products

Edit `apps/api/simple-server.js`:
```javascript
const products = [
  {
    id: '11',
    slug: 'your-product-slug',
    productName: 'Your Product Name',
    shortDescription: 'Product description',
    price: 5000,
    compareAtPrice: 7000,
    primaryImageUrl: '/images/your-image.jpg',
    averageRating: 4.5,
    reviewCount: 50,
    isInStock: true,
    associatedPlanets: ['Venus'],
    associatedZodiacSigns: ['Taurus'],
    category: 'gemstones',
  },
  // ... add more products
];
```

### Customize AI Responses

Edit `generateAIResponse()` function in `apps/api/simple-server.js`:
```javascript
if (messageLower.includes('your-keyword')) {
  response = 'Your custom AI response here...';
  recommendations = [
    {
      id: '1',
      name: 'Product Name',
      price: 5000,
      reason: 'Why this product'
    }
  ];
}
```

### Change Theme Colors

The app uses Tailwind CSS. Main colors:
- **Orange** (`orange-500`) - Primary
- **Purple** (`purple-600`) - Secondary
- **Amber** (`amber-500`) - Accent

## 🚢 Deployment

### Deploy Backend

**Vercel / Netlify / Railway:**
```bash
cd apps/api
npm install
npm start
```

Set environment variable: `PORT=5000`

**Heroku:**
```bash
git subtree push --prefix apps/api heroku main
```

### Deploy Frontend

**Vercel (Recommended):**
```bash
cd apps/web
vercel
```

Set environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Netlify:**
```bash
cd apps/web
npm run build
netlify deploy --prod
```

## 📊 File-Based Database

Data is stored in JSON files in `apps/api/data/`:
- `users.json` - User data
- `chats.json` - Chat conversations
- `cart.json` - Shopping carts
- `orders.json` - Orders

### Backup Data
```bash
cd apps/api
node -e "require('./database').backup()"
```

### Migrate to Real Database (Later)

When ready to scale, you can migrate to PostgreSQL/MySQL:
1. Keep the same API structure
2. Replace `database.js` functions with SQL queries
3. No frontend changes needed!

## ❓ Troubleshooting

**Port already in use?**
```bash
# Change port in apps/api/.env
PORT=5001
```

**Frontend can't connect?**
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify CORS is not blocking requests

**Module not found?**
```bash
# Delete node_modules and reinstall
cd apps/api && rm -rf node_modules && npm install
cd apps/web && rm -rf node_modules && npm install
```

**Chat not working?**
- Ensure backend is running
- Check http://localhost:5000/health
- Look at browser Network tab for errors

## 🔐 Security Notes

For production deployment:
- Add rate limiting
- Implement user authentication
- Use HTTPS
- Add input validation
- Sanitize user inputs
- Add CSRF protection

## 📈 Future Enhancements

Optional features to add later:
- [ ] User authentication (JWT)
- [ ] Real database (PostgreSQL)
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Real AI integration (OpenAI/Claude API)
- [ ] Birth chart calculations
- [ ] Palm reading with image upload

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 📞 Support

Having issues? Check:
1. [START-HERE.md](START-HERE.md) - Quick start guide
2. [README-SIMPLE.md](README-SIMPLE.md) - Detailed setup
3. Backend logs in terminal
4. Browser console for frontend errors

## 🌟 Show Your Support

If you find this project useful, please give it a ⭐ on GitHub!

---

**Built with simplicity in mind. No Redis. No PostgreSQL. Just works!** 🚀
