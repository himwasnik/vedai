require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const { callBedrockAI, analyzeKundli } = require('./bedrock-service');

const app = express();

// AWS Bedrock will use credential chain automatically (same as your test!)
console.log('✅ AWS Bedrock configured. Using credential chain (same as test_anthropic_api.js)');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON' });
  }
  next();
});

// In-memory storage
const products = [
  {
    id: '1',
    slug: 'ruby-gemstone',
    productName: 'Natural Ruby (Manikya)',
    shortDescription: 'Enhances leadership, confidence, and vitality. Associated with the Sun.',
    price: 15000,
    compareAtPrice: 20000,
    primaryImageUrl: '/images/ruby.jpg',
    averageRating: 4.8,
    reviewCount: 124,
    isInStock: true,
    associatedPlanets: ['Sun'],
    associatedZodiacSigns: ['Leo'],
    category: 'gemstones',
  },
  {
    id: '2',
    slug: 'emerald-gemstone',
    productName: 'Natural Emerald (Panna)',
    shortDescription: 'Boosts intelligence, communication, and business success. Associated with Mercury.',
    price: 12000,
    compareAtPrice: 16000,
    primaryImageUrl: '/images/emerald.jpg',
    averageRating: 4.7,
    reviewCount: 98,
    isInStock: true,
    associatedPlanets: ['Mercury'],
    associatedZodiacSigns: ['Gemini', 'Virgo'],
    category: 'gemstones',
  },
  {
    id: '3',
    slug: 'blue-sapphire',
    productName: 'Blue Sapphire (Neelam)',
    shortDescription: 'Brings wealth, protection, and spiritual growth. Associated with Saturn.',
    price: 25000,
    compareAtPrice: 35000,
    primaryImageUrl: '/images/sapphire.jpg',
    averageRating: 4.9,
    reviewCount: 156,
    isInStock: true,
    associatedPlanets: ['Saturn'],
    associatedZodiacSigns: ['Capricorn', 'Aquarius'],
    category: 'gemstones',
  },
  {
    id: '4',
    slug: 'pearl',
    productName: 'Natural Pearl (Moti)',
    shortDescription: 'Calms the mind, enhances emotions, and brings peace. Associated with the Moon.',
    price: 8000,
    compareAtPrice: 11000,
    primaryImageUrl: '/images/pearl.jpg',
    averageRating: 4.6,
    reviewCount: 87,
    isInStock: true,
    associatedPlanets: ['Moon'],
    associatedZodiacSigns: ['Cancer'],
    category: 'gemstones',
  },
  {
    id: '5',
    slug: 'yellow-sapphire',
    productName: 'Yellow Sapphire (Pukhraj)',
    shortDescription: 'Brings prosperity, wisdom, and good fortune. Associated with Jupiter.',
    price: 18000,
    compareAtPrice: 24000,
    primaryImageUrl: '/images/yellow-sapphire.jpg',
    averageRating: 4.8,
    reviewCount: 112,
    isInStock: true,
    associatedPlanets: ['Jupiter'],
    associatedZodiacSigns: ['Sagittarius', 'Pisces'],
    category: 'gemstones',
  },
  {
    id: '6',
    slug: 'red-coral',
    productName: 'Red Coral (Moonga)',
    shortDescription: 'Boosts courage, energy, and physical strength. Associated with Mars.',
    price: 10000,
    compareAtPrice: 14000,
    primaryImageUrl: '/images/coral.jpg',
    averageRating: 4.5,
    reviewCount: 89,
    isInStock: true,
    associatedPlanets: ['Mars'],
    associatedZodiacSigns: ['Aries', 'Scorpio'],
    category: 'gemstones',
  },
  {
    id: '7',
    slug: '5-mukhi-rudraksha',
    productName: '5 Mukhi Rudraksha',
    shortDescription: 'Most common and powerful Rudraksha for overall well-being and health.',
    price: 500,
    compareAtPrice: 800,
    primaryImageUrl: '/images/rudraksha.jpg',
    averageRating: 4.8,
    reviewCount: 234,
    isInStock: true,
    associatedPlanets: ['Jupiter'],
    category: 'rudraksha',
  },
  {
    id: '8',
    slug: 'hessonite-gomed',
    productName: 'Hessonite (Gomed)',
    shortDescription: 'Brings confidence, grounding energy, and clarity. Associated with Rahu.',
    price: 11000,
    compareAtPrice: 15000,
    primaryImageUrl: '/images/hessonite.jpg',
    averageRating: 4.6,
    reviewCount: 76,
    isInStock: true,
    associatedPlanets: ['Rahu'],
    associatedZodiacSigns: ['Virgo', 'Gemini'],
    category: 'gemstones',
  },
  {
    id: '9',
    slug: 'cats-eye-lahsunia',
    productName: "Cat's Eye (Lahsunia)",
    shortDescription: "Protects from evil eye and negative influences. Associated with Ketu.",
    price: 9000,
    compareAtPrice: 13000,
    primaryImageUrl: '/images/cats-eye.jpg',
    averageRating: 4.5,
    reviewCount: 62,
    isInStock: true,
    associatedPlanets: ['Ketu'],
    associatedZodiacSigns: ['Virgo', 'Scorpio'],
    category: 'gemstones',
  },
  {
    id: '10',
    slug: 'diamond-heera',
    productName: 'Diamond (Heera)',
    shortDescription: 'Enhances luxury, beauty, and divine grace. Associated with Venus.',
    price: 50000,
    compareAtPrice: 75000,
    primaryImageUrl: '/images/diamond.jpg',
    averageRating: 4.9,
    reviewCount: 45,
    isInStock: true,
    associatedPlanets: ['Venus'],
    associatedZodiacSigns: ['Libra', 'Taurus'],
    category: 'gemstones',
  },
  {
    id: '11',
    slug: 'white-sapphire',
    productName: 'White Sapphire (Safed Pukhraj)',
    shortDescription: 'Promotes clarity, spirituality, and divine connection. Venus substitute.',
    price: 16000,
    compareAtPrice: 22000,
    primaryImageUrl: '/images/white-sapphire.jpg',
    averageRating: 4.7,
    reviewCount: 54,
    isInStock: true,
    associatedPlanets: ['Venus'],
    associatedZodiacSigns: ['Libra', 'Taurus'],
    category: 'gemstones',
  },
  {
    id: '12',
    slug: 'amethyst',
    productName: 'Amethyst',
    shortDescription: 'Spiritual protection and wisdom. Associated with Jupiter and Saturn.',
    price: 5000,
    compareAtPrice: 8000,
    primaryImageUrl: '/images/amethyst.jpg',
    averageRating: 4.6,
    reviewCount: 98,
    isInStock: true,
    associatedPlanets: ['Jupiter', 'Saturn'],
    associatedZodiacSigns: ['Aquarius', 'Pisces'],
    category: 'gemstones',
  },
  {
    id: '13',
    slug: 'citrine',
    productName: 'Citrine',
    shortDescription: 'Attracts wealth, success, and positive energy. Jupiter stone.',
    price: 4500,
    compareAtPrice: 7000,
    primaryImageUrl: '/images/citrine.jpg',
    averageRating: 4.7,
    reviewCount: 112,
    isInStock: true,
    associatedPlanets: ['Jupiter'],
    associatedZodiacSigns: ['Sagittarius', 'Gemini'],
    category: 'gemstones',
  },
  {
    id: '14',
    slug: 'garnet',
    productName: 'Garnet',
    shortDescription: 'Boosts energy, passion, and life force. Associated with Mars.',
    price: 6000,
    compareAtPrice: 9500,
    primaryImageUrl: '/images/garnet.jpg',
    averageRating: 4.5,
    reviewCount: 73,
    isInStock: true,
    associatedPlanets: ['Mars'],
    associatedZodiacSigns: ['Aries', 'Scorpio'],
    category: 'gemstones',
  },
  {
    id: '15',
    slug: 'aquamarine',
    productName: 'Aquamarine',
    shortDescription: 'Enhances communication, clarity, and expression. Mercury stone.',
    price: 7000,
    compareAtPrice: 10500,
    primaryImageUrl: '/images/aquamarine.jpg',
    averageRating: 4.6,
    reviewCount: 67,
    isInStock: true,
    associatedPlanets: ['Mercury'],
    associatedZodiacSigns: ['Gemini', 'Virgo'],
    category: 'gemstones',
  },
  {
    id: '16',
    slug: 'moonstone',
    productName: 'Moonstone',
    shortDescription: 'Soothes emotions, enhances intuition, and balances hormones.',
    price: 5500,
    compareAtPrice: 8500,
    primaryImageUrl: '/images/moonstone.jpg',
    averageRating: 4.7,
    reviewCount: 89,
    isInStock: true,
    associatedPlanets: ['Moon'],
    associatedZodiacSigns: ['Cancer', 'Pisces'],
    category: 'gemstones',
  },
  {
    id: '17',
    slug: 'carnelian',
    productName: 'Carnelian',
    shortDescription: 'Boosts vitality, courage, and creative energy. Mars energy.',
    price: 4000,
    compareAtPrice: 6500,
    primaryImageUrl: '/images/carnelian.jpg',
    averageRating: 4.6,
    reviewCount: 95,
    isInStock: true,
    associatedPlanets: ['Mars'],
    associatedZodiacSigns: ['Aries', 'Leo'],
    category: 'gemstones',
  },
  {
    id: '18',
    slug: 'opal',
    productName: 'Opal',
    shortDescription: 'Enhances intuition, creativity, and emotional balance. Venus energy.',
    price: 8000,
    compareAtPrice: 12000,
    primaryImageUrl: '/images/opal.jpg',
    averageRating: 4.5,
    reviewCount: 51,
    isInStock: true,
    associatedPlanets: ['Venus'],
    associatedZodiacSigns: ['Libra', 'Scorpio'],
    category: 'gemstones',
  },
  {
    id: '19',
    slug: 'turquoise',
    productName: 'Turquoise',
    shortDescription: 'Protects, brings peace, and enhances throat chakra. Jupiter stone.',
    price: 3500,
    compareAtPrice: 5500,
    primaryImageUrl: '/images/turquoise.jpg',
    averageRating: 4.6,
    reviewCount: 78,
    isInStock: true,
    associatedPlanets: ['Jupiter'],
    associatedZodiacSigns: ['Sagittarius', 'Aquarius'],
    category: 'gemstones',
  },
  {
    id: '20',
    slug: 'lapis-lazuli',
    productName: 'Lapis Lazuli',
    shortDescription: 'Deepens spiritual awareness and enhances intuition. Saturn stone.',
    price: 6500,
    compareAtPrice: 10000,
    primaryImageUrl: '/images/lapis-lazuli.jpg',
    averageRating: 4.7,
    reviewCount: 82,
    isInStock: true,
    associatedPlanets: ['Saturn', 'Jupiter'],
    associatedZodiacSigns: ['Sagittarius', 'Aquarius'],
    category: 'gemstones',
  },
  {
    id: '21',
    slug: 'shri-yantra',
    productName: 'Shri Yantra (Brass)',
    shortDescription: 'Sacred geometry for prosperity, abundance, and spiritual growth.',
    price: 2500,
    compareAtPrice: 3500,
    primaryImageUrl: '/images/yantra.jpg',
    averageRating: 4.7,
    reviewCount: 145,
    isInStock: true,
    category: 'yantras',
  },
  {
    id: '9',
    slug: 'amethyst-crystal',
    productName: 'Amethyst Crystal',
    shortDescription: 'Promotes calmness, clarity, and spiritual awareness.',
    price: 1200,
    primaryImageUrl: '/images/amethyst.jpg',
    averageRating: 4.5,
    reviewCount: 76,
    isInStock: true,
    category: 'crystals',
  },
  {
    id: '10',
    slug: 'citrine-crystal',
    productName: 'Citrine Crystal',
    shortDescription: 'Attracts wealth, success, and positive energy.',
    price: 1500,
    primaryImageUrl: '/images/citrine.jpg',
    averageRating: 4.6,
    reviewCount: 92,
    isInStock: true,
    category: 'crystals',
  },
];

// Helper function to get gemstone recommendations based on message keywords
function getGemstoneRecommendations(message) {
  const messageLower = message.toLowerCase();
  let recommendations = [];

  if (messageLower.includes('gemstone') || messageLower.includes('stone') || messageLower.includes('crystal')) {
    // For gemstone-related queries, return top gemstones to show variety
    recommendations = [
      { id: '3', name: 'Blue Sapphire (Neelam)', price: 25000, reason: 'Powerful Saturn stone for discipline' },
      { id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Jupiter stone for prosperity' },
      { id: '2', name: 'Natural Emerald (Panna)', price: 12000, reason: 'Mercury stone for success' }
    ];
  } else if (messageLower.includes('career') || messageLower.includes('job') || messageLower.includes('business')) {
    recommendations = [
      { id: '2', name: 'Natural Emerald (Panna)', price: 12000, reason: 'Enhances communication and business success' },
      { id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Brings career opportunities and wisdom' }
    ];
  } else if (messageLower.includes('love') || messageLower.includes('relationship') || messageLower.includes('marriage')) {
    recommendations = [
      { id: '4', name: 'Natural Pearl (Moti)', price: 8000, reason: 'Brings emotional balance and peace in relationships' }
    ];
  } else if (messageLower.includes('health') || messageLower.includes('disease') || messageLower.includes('wellness')) {
    recommendations = [
      { id: '1', name: 'Natural Ruby (Manikya)', price: 15000, reason: 'Boosts vitality and overall health' }
    ];
  } else if (messageLower.includes('wealth') || messageLower.includes('money') || messageLower.includes('prosperity') || messageLower.includes('financial')) {
    recommendations = [
      { id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Attracts wealth and prosperity' }
    ];
  } else if (messageLower.includes('stress') || messageLower.includes('anxiety') || messageLower.includes('peace') || messageLower.includes('calm')) {
    recommendations = [
      { id: '4', name: 'Natural Pearl (Moti)', price: 8000, reason: 'Calms mind and reduces stress' }
    ];
  } else if (messageLower.includes('protection') || messageLower.includes('negative') || messageLower.includes('evil eye')) {
    recommendations = [
      { id: '6', name: 'Red Coral (Moonga)', price: 10000, reason: 'Protects from enemies and negative forces' },
      { id: '9', name: "Cat's Eye (Lahsunia)", price: 9000, reason: 'Shields from negative energies' }
    ];
  }

  return recommendations;
}

// Fallback Kundli analysis when Bedrock is not available
function generateFallbackKundliAnalysis(birthDetails) {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender } = birthDetails;

  return `🌟 Vedic Birth Chart Analysis for ${name}

📅 Birth Details:
- Date: ${dateOfBirth}
- Time: ${timeOfBirth}
- Place: ${placeOfBirth}
- Gender: ${gender || 'Not specified'}

🔮 Astrological Insights:

**Ascendant (Lagna):**
Your rising sign determines your approach to life and first impressions. The Ascendant lord's placement suggests your life path and opportunities.

**Moon Sign (Rashi):**
The Moon governs your emotional nature and mind. A strong Moon brings mental peace, good relationships with mother, and emotional stability.

**Sun Sign:**
The Sun represents your soul, father, authority, and life purpose. A well-placed Sun brings leadership qualities, confidence, and success in career.

**Planetary Positions:**
- Mercury: Governs communication, business, and intelligence
- Venus: Rules love, relationships, and artistic abilities
- Mars: Indicates energy, courage, and property matters
- Jupiter: Brings wisdom, wealth, and spiritual growth
- Saturn: Represents discipline, hard work, and longevity

**Current Dasha Period:**
Planetary periods (Dashas) influence different life phases. Understanding your current Dasha helps in timing important decisions.

**Recommendations:**
1. Strengthen beneficial planets through gemstones
2. Perform remedies for challenging planetary positions
3. Choose auspicious times (Muhurta) for important events
4. Follow daily spiritual practices for planetary balance

💎 Gemstone Recommendations:
Based on your chart, specific gemstones can strengthen planetary influences and bring positive results.

⚠️ Note: This is a general analysis. For personalized insights, enable AWS Bedrock AI integration for detailed predictions.`;
}

// Get gemstone recommendations based on Kundli analysis
function getGemstoneRecommendationsForKundli(analysis) {
  // Extract gemstones mentioned in the analysis text
  const analysisLower = analysis.toLowerCase();
  const recommendations = [];
  const addedIds = new Set(); // Track added IDs to avoid duplicates

  // Map of gemstone mentions to product info
  const gemstoneMap = {
    // Primary Vedic Gemstones
    'blue sapphire': { id: '3', name: 'Blue Sapphire (Neelam)', price: 25000, reason: 'Strengthens Saturn for discipline and success' },
    'neelam': { id: '3', name: 'Blue Sapphire (Neelam)', price: 25000, reason: 'Strengthens Saturn for discipline and success' },
    'yellow sapphire': { id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Enhances Jupiter for wealth and wisdom' },
    'pukhraj': { id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Enhances Jupiter for wealth and wisdom' },
    'emerald': { id: '2', name: 'Natural Emerald (Panna)', price: 12000, reason: 'Strengthens Mercury for communication and business' },
    'panna': { id: '2', name: 'Natural Emerald (Panna)', price: 12000, reason: 'Strengthens Mercury for communication and business' },
    'ruby': { id: '1', name: 'Natural Ruby (Manikya)', price: 15000, reason: 'Strengthens Sun for vitality and leadership' },
    'manikya': { id: '1', name: 'Natural Ruby (Manikya)', price: 15000, reason: 'Strengthens Sun for vitality and leadership' },
    'pearl': { id: '4', name: 'Natural Pearl (Moti)', price: 8000, reason: 'Balances Moon for emotional stability' },
    'moti': { id: '4', name: 'Natural Pearl (Moti)', price: 8000, reason: 'Balances Moon for emotional stability' },
    'red coral': { id: '6', name: 'Red Coral (Moonga)', price: 10000, reason: 'Boosts courage and energy' },
    'moonga': { id: '6', name: 'Red Coral (Moonga)', price: 10000, reason: 'Boosts courage and energy' },
    'hessonite': { id: '8', name: 'Hessonite (Gomed)', price: 11000, reason: 'Brings confidence and grounding energy' },
    'gomed': { id: '8', name: 'Hessonite (Gomed)', price: 11000, reason: 'Brings confidence and grounding energy' },
    'cat\'s eye': { id: '9', name: "Cat's Eye (Lahsunia)", price: 9000, reason: 'Protects from negative influences' },
    'lahsunia': { id: '9', name: "Cat's Eye (Lahsunia)", price: 9000, reason: 'Protects from negative influences' },
    
    // Secondary & Complementary Gemstones
    'diamond': { id: '10', name: 'Diamond (Heera)', price: 50000, reason: 'Enhances luxury, beauty, and grace' },
    'heera': { id: '10', name: 'Diamond (Heera)', price: 50000, reason: 'Enhances luxury, beauty, and grace' },
    'white sapphire': { id: '11', name: 'White Sapphire (Safed Pukhraj)', price: 16000, reason: 'Promotes clarity and spirituality' },
    'safed pukhraj': { id: '11', name: 'White Sapphire (Safed Pukhraj)', price: 16000, reason: 'Promotes clarity and spirituality' },
    'amethyst': { id: '12', name: 'Amethyst', price: 5000, reason: 'Spiritual protection and wisdom' },
    'citrine': { id: '13', name: 'Citrine', price: 4500, reason: 'Attracts wealth and positive energy' },
    'garnet': { id: '14', name: 'Garnet', price: 6000, reason: 'Boosts energy and passion' },
    'aquamarine': { id: '15', name: 'Aquamarine', price: 7000, reason: 'Enhances communication and clarity' },
    'moonstone': { id: '16', name: 'Moonstone', price: 5500, reason: 'Soothes emotions and enhances intuition' },
    'carnelian': { id: '17', name: 'Carnelian', price: 4000, reason: 'Boosts vitality and creative energy' },
    'opal': { id: '18', name: 'Opal', price: 8000, reason: 'Enhances intuition and creativity' },
    'turquoise': { id: '19', name: 'Turquoise', price: 3500, reason: 'Protects and brings peace' },
    'lapis lazuli': { id: '20', name: 'Lapis Lazuli', price: 6500, reason: 'Deepens spiritual awareness' },
    'lapis': { id: '20', name: 'Lapis Lazuli', price: 6500, reason: 'Deepens spiritual awareness' }
  };

  // First pass: Look for explicitly mentioned gemstones
  for (const [gemstone, product] of Object.entries(gemstoneMap)) {
    if (analysisLower.includes(gemstone) && !addedIds.has(product.id)) {
      recommendations.push(product);
      addedIds.add(product.id);
    }
  }

  // Second pass: Look for planetary keywords and add corresponding gemstones
  if (analysisLower.includes('mercury') && !addedIds.has('2')) {
    recommendations.push({ id: '2', name: 'Natural Emerald (Panna)', price: 12000, reason: 'Strengthens Mercury for communication' });
    addedIds.add('2');
  }
  if (analysisLower.includes('jupiter') && !addedIds.has('5')) {
    recommendations.push({ id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Enhances Jupiter for prosperity' });
    addedIds.add('5');
  }
  if (analysisLower.includes('sun') && !addedIds.has('1')) {
    recommendations.push({ id: '1', name: 'Natural Ruby (Manikya)', price: 15000, reason: 'Strengthens Sun for vitality' });
    addedIds.add('1');
  }
  if ((analysisLower.includes('moon') || analysisLower.includes('emotional')) && !addedIds.has('4')) {
    recommendations.push({ id: '4', name: 'Natural Pearl (Moti)', price: 8000, reason: 'Balances Moon for emotional stability' });
    addedIds.add('4');
  }
  if (analysisLower.includes('saturn') && !addedIds.has('3')) {
    recommendations.push({ id: '3', name: 'Blue Sapphire (Neelam)', price: 25000, reason: 'Strengthens Saturn' });
    addedIds.add('3');
  }
  if ((analysisLower.includes('mars') || analysisLower.includes('courage') || analysisLower.includes('energy')) && !addedIds.has('6')) {
    recommendations.push({ id: '6', name: 'Red Coral (Moonga)', price: 10000, reason: 'Boosts courage and strength' });
    addedIds.add('6');
  }
  if ((analysisLower.includes('rahu') || analysisLower.includes('grounding')) && !addedIds.has('8')) {
    recommendations.push({ id: '8', name: 'Hessonite (Gomed)', price: 11000, reason: 'Brings confidence and grounding' });
    addedIds.add('8');
  }
  if ((analysisLower.includes('ketu') || analysisLower.includes('protection')) && !addedIds.has('9')) {
    recommendations.push({ id: '9', name: "Cat's Eye (Lahsunia)", price: 9000, reason: 'Protects from negative influences' });
    addedIds.add('9');
  }
  if ((analysisLower.includes('venus') || analysisLower.includes('beauty') || analysisLower.includes('luxury')) && !addedIds.has('10')) {
    recommendations.push({ id: '10', name: 'Diamond (Heera)', price: 50000, reason: 'Enhances beauty and grace' });
    addedIds.add('10');
  }

  // If no specific recommendations found, add default ones
  if (recommendations.length === 0) {
    recommendations.push(
      { id: '5', name: 'Yellow Sapphire (Pukhraj)', price: 18000, reason: 'Universal gemstone for prosperity' },
      { id: '2', name: 'Natural Emerald (Panna)', price: 12000, reason: 'For overall growth and success' }
    );
  }

  return recommendations.slice(0, 3); // Return max 3 recommendations
}

// AI Astrologer responses based on keywords
function generateAIResponse(message, history) {
  const messageLower = message.toLowerCase();
  let response = '';
  let recommendations = [];

  // Check for keywords and generate appropriate response
  if (messageLower.includes('career') || messageLower.includes('job') || messageLower.includes('business')) {
    response = `Based on astrological insights, career matters are influenced by your professional houses. For career success, I recommend:

• Focus on your strengths and communication skills
• Mercury influences career growth - consider wearing Emerald (Panna) to enhance business acumen and communication
• Jupiter brings wisdom and expansion - Yellow Sapphire (Pukhraj) can boost career opportunities
• The current planetary positions suggest a favorable time for professional growth

Would you like me to provide more specific guidance based on your birth details?`;

    recommendations = [
      {
        id: '2',
        name: 'Natural Emerald (Panna)',
        price: 12000,
        reason: 'Enhances communication and business success'
      },
      {
        id: '5',
        name: 'Yellow Sapphire (Pukhraj)',
        price: 18000,
        reason: 'Brings career opportunities and wisdom'
      }
    ];
  } else if (messageLower.includes('love') || messageLower.includes('relationship') || messageLower.includes('marriage')) {
    response = `In matters of the heart, Venus and Moon play crucial roles. For harmonious relationships:

• Venus governs love and romance - consider wearing a Diamond or Opal
• Moon influences emotions - Pearl (Moti) can bring emotional balance
• The 7th house represents partnerships - strengthening it brings relationship harmony

Natural Pearl can help calm emotions and bring peace to your relationships. Would you like to know more about your compatibility or relationship timing?`;

    recommendations = [
      {
        id: '4',
        name: 'Natural Pearl (Moti)',
        price: 8000,
        reason: 'Brings emotional balance and peace in relationships'
      }
    ];
  } else if (messageLower.includes('health') || messageLower.includes('disease') || messageLower.includes('wellness')) {
    response = `Your health is connected to planetary influences. For overall wellness:

• Sun represents vitality - Ruby (Manikya) can boost energy and immunity
• Moon governs mental health - Pearl helps with emotional wellbeing
• Mars influences physical strength - Red Coral (Moonga) enhances stamina
• Wear a 5 Mukhi Rudraksha for overall health and well-being

I recommend focusing on both physical and spiritual health practices. Regular meditation and yoga are beneficial.`;

    recommendations = [
      {
        id: '1',
        name: 'Natural Ruby (Manikya)',
        price: 15000,
        reason: 'Boosts vitality and overall health'
      },
      {
        id: '7',
        name: '5 Mukhi Rudraksha',
        price: 500,
        reason: 'Promotes overall well-being and health'
      }
    ];
  } else if (messageLower.includes('wealth') || messageLower.includes('money') || messageLower.includes('prosperity') || messageLower.includes('financial')) {
    response = `For wealth and prosperity, focus on strengthening Jupiter and Mercury:

• Jupiter is the planet of abundance - Yellow Sapphire (Pukhraj) attracts wealth
• Mercury governs business - Emerald enhances financial intelligence
• Install Shri Yantra in your workspace for prosperity
• Citrine Crystal attracts money and success

The 2nd and 11th houses govern finances. Strengthening these areas can improve your financial situation.`;

    recommendations = [
      {
        id: '5',
        name: 'Yellow Sapphire (Pukhraj)',
        price: 18000,
        reason: 'Attracts wealth and prosperity'
      },
      {
        id: '8',
        name: 'Shri Yantra (Brass)',
        price: 2500,
        reason: 'Sacred geometry for abundance'
      },
      {
        id: '10',
        name: 'Citrine Crystal',
        price: 1500,
        reason: 'Manifests money and success'
      }
    ];
  } else if (messageLower.includes('luck') || messageLower.includes('fortune')) {
    response = `To enhance luck and good fortune:

• Jupiter brings good fortune - wear Yellow Sapphire (Pukhraj)
• Strengthen your 9th house (house of luck) with appropriate gemstones
• 5 Mukhi Rudraksha brings overall good luck
• Keep a Shri Yantra for positive energy flow

Lucky periods are indicated by Jupiter transits. Would you like to know about your current planetary periods?`;

    recommendations = [
      {
        id: '5',
        name: 'Yellow Sapphire (Pukhraj)',
        price: 18000,
        reason: 'Brings good fortune and luck'
      },
      {
        id: '7',
        name: '5 Mukhi Rudraksha',
        price: 500,
        reason: 'Attracts positive energy and luck'
      }
    ];
  } else if (messageLower.includes('stress') || messageLower.includes('anxiety') || messageLower.includes('peace') || messageLower.includes('calm')) {
    response = `For mental peace and stress relief:

• Moon governs mind - Pearl (Moti) brings calmness
• Amethyst Crystal promotes spiritual peace and clarity
• Practice meditation with Rudraksha for inner peace
• Saturn's influence can be balanced with Blue Sapphire (only after consultation)

I recommend starting with Amethyst Crystal and Pearl. These gentle stones help calm the mind without strong side effects.`;

    recommendations = [
      {
        id: '4',
        name: 'Natural Pearl (Moti)',
        price: 8000,
        reason: 'Calms mind and reduces stress'
      },
      {
        id: '9',
        name: 'Amethyst Crystal',
        price: 1200,
        reason: 'Promotes peace and spiritual clarity'
      }
    ];
  } else if (messageLower.includes('protection') || messageLower.includes('negative') || messageLower.includes('evil eye')) {
    response = `For protection from negative energies:

• Blue Sapphire (Neelam) offers powerful protection (consult before wearing)
• Red Coral (Moonga) protects from enemies and negative forces
• 5 Mukhi Rudraksha shields from negativity
• Black Tourmaline or Obsidian crystals are also protective

I recommend starting with Rudraksha for gentle yet effective protection. Would you like to know more about protective mantras?`;

    recommendations = [
      {
        id: '7',
        name: '5 Mukhi Rudraksha',
        price: 500,
        reason: 'Shields from negative energies'
      },
      {
        id: '6',
        name: 'Red Coral (Moonga)',
        price: 10000,
        reason: 'Protects from enemies and negative forces'
      }
    ];
  } else if (messageLower.includes('gemstone') || messageLower.includes('stone') || messageLower.includes('recommend')) {
    response = `I'd be happy to recommend gemstones for you! To provide the best recommendations, I need to understand your specific needs:

• Career and Business - Emerald, Yellow Sapphire
• Love and Relationships - Pearl, Diamond
• Health and Vitality - Ruby, Red Coral
• Wealth and Prosperity - Yellow Sapphire, Citrine
• Peace and Calm - Pearl, Amethyst
• Protection - Blue Sapphire, Rudraksha

What area of life would you like to focus on? Or tell me about your birth details (date, time, place) for personalized recommendations.`;

    recommendations = [
      {
        id: '1',
        name: 'Natural Ruby (Manikya)',
        price: 15000,
        reason: 'For vitality and leadership'
      },
      {
        id: '4',
        name: 'Natural Pearl (Moti)',
        price: 8000,
        reason: 'For emotional balance'
      },
      {
        id: '5',
        name: 'Yellow Sapphire (Pukhraj)',
        price: 18000,
        reason: 'For prosperity and wisdom'
      }
    ];
  } else {
    response = `Namaste! I'm here to guide you with Vedic astrology wisdom. I can help you with:

• Career and professional growth
• Love and relationships
• Health and wellness
• Wealth and prosperity
• Gemstone recommendations
• Birth chart insights
• Lucky periods and timing
• Spiritual remedies

Please share what's on your mind, and I'll provide personalized guidance. If you have your birth details (date, time, place), that would help me give more accurate insights!

What would you like to know about?`;
  }

  return { response, recommendations };
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VedAI Backend is running!' });
});

// Get all products
app.get('/api/v1/products', (req, res) => {
  res.json({
    success: true,
    products: products,
    total: products.length
  });
});

// Chat endpoint with AWS Bedrock AI
app.post('/api/v1/chat/message', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Try AWS Bedrock AI first
    let aiResponse = await callBedrockAI(message, history || []);

    // If Bedrock fails (no credentials), use fallback
    if (!aiResponse) {
      console.log('AWS Bedrock failed, using fallback response');
      const fallbackData = generateAIResponse(message, history || []);
      aiResponse = fallbackData.response;
    }

    // Generate recommendations based on BOTH the user message AND the AI response
    let recommendations = getGemstoneRecommendations(message);
    
    // If no recommendations from user message, try to extract from AI response
    if (recommendations.length === 0 && aiResponse) {
      recommendations = getGemstoneRecommendationsForKundli(aiResponse);
    }

    res.json({
      success: true,
      response: aiResponse,
      recommendations: recommendations
    });
  } catch (error) {
    console.error('Chat error:', error);
    // Fallback to mock response
    const fallbackData = generateAIResponse(message, history || []);
    res.json({
      success: true,
      response: fallbackData.response,
      recommendations: fallbackData.recommendations
    });
  }
});

// Kundli Analysis endpoint with AWS Bedrock AI
app.post('/api/v1/kundli/analyze', async (req, res) => {
  try {
    const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender } = req.body;

    if (!name || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({
        success: false,
        error: 'All birth details are required (name, dateOfBirth, timeOfBirth, placeOfBirth)'
      });
    }

    console.log(`Analyzing Kundli for: ${name}, DOB: ${dateOfBirth}, Time: ${timeOfBirth}, Place: ${placeOfBirth}`);

    // Analyze Kundli using AWS Bedrock AI
    const analysis = await analyzeKundli({
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      gender: gender || 'Not specified'
    });

    // If Bedrock fails, provide a fallback response
    const finalAnalysis = analysis || generateFallbackKundliAnalysis({ name, dateOfBirth, timeOfBirth, placeOfBirth, gender });

    // Don't include recommendations in Kundli analysis - only in chat messages
    res.json({
      success: true,
      analysis: finalAnalysis,
      birthDetails: {
        name,
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
        gender: gender || 'Not specified'
      }
    });
  } catch (error) {
    console.error('Kundli analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze Kundli'
    });
  }
});

// External AI chat endpoint
const API_KEY = process.env.AI_API_KEY || 'AIzaSyBwVOXzwivML5-ZXbthQt5RiqYuv28QtvA';

app.post('/api/v1/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch('https://api.example.com/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ query: message }),
    });

    if (!response.ok) throw new Error('Failed to fetch AI response');

    const data = await response.json();
    res.json({ reply: data.answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch AI response' });
  }
});

// Add to cart
app.post('/api/v1/cart/add', (req, res) => {
  const { productId, quantity } = req.body;

  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({
    success: true,
    message: 'Product added to cart',
    product: product,
    quantity: quantity || 1
  });
});

// Get product by slug
app.get('/api/v1/products/:slug', (req, res) => {
  const { slug } = req.params;
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({
    success: true,
    product: product
  });
});

// ==========================================
// ADMIN DASHBOARD API ENDPOINTS (CRUD)
// ==========================================

// Get all products for admin
app.get('/api/v1/admin/products', (req, res) => {
  res.json({
    success: true,
    total: products.length,
    products: products
  });
});

// Get single product for editing
app.get('/api/v1/admin/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    product: product
  });
});

// Create new product
app.post('/api/v1/admin/products', (req, res) => {
  try {
    const { productName, slug, shortDescription, price, compareAtPrice, category, associatedPlanets, associatedZodiacSigns } = req.body;
    
    if (!productName || !slug || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productName, slug, price'
      });
    }
    
    // Generate new ID
    const newId = (Math.max(...products.map(p => parseInt(p.id))) + 1).toString();
    
    const newProduct = {
      id: newId,
      slug,
      productName,
      shortDescription: shortDescription || '',
      price: parseFloat(price),
      compareAtPrice: parseFloat(compareAtPrice) || parseFloat(price),
      primaryImageUrl: '/images/default.jpg',
      averageRating: 4.5,
      reviewCount: 0,
      isInStock: true,
      associatedPlanets: associatedPlanets || [],
      associatedZodiacSigns: associatedZodiacSigns || [],
      category: category || 'gemstones'
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update product
app.put('/api/v1/admin/products/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const { productName, slug, shortDescription, price, compareAtPrice, category, associatedPlanets, associatedZodiacSigns, isInStock } = req.body;
    
    // Update only provided fields
    if (productName) products[productIndex].productName = productName;
    if (slug) products[productIndex].slug = slug;
    if (shortDescription) products[productIndex].shortDescription = shortDescription;
    if (price) products[productIndex].price = parseFloat(price);
    if (compareAtPrice) products[productIndex].compareAtPrice = parseFloat(compareAtPrice);
    if (category) products[productIndex].category = category;
    if (associatedPlanets) products[productIndex].associatedPlanets = associatedPlanets;
    if (associatedZodiacSigns) products[productIndex].associatedZodiacSigns = associatedZodiacSigns;
    if (isInStock !== undefined) products[productIndex].isInStock = isInStock;
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: products[productIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete product
app.delete('/api/v1/admin/products/:id', (req, res) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const deletedProduct = products.splice(productIndex, 1);
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      product: deletedProduct[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║       VedAI Backend Server Started       ║
╠══════════════════════════════════════════╣
║  Port: ${PORT}                              ║
║  Status: ✓ Running                       ║
║  API: http://localhost:${PORT}              ║
╚══════════════════════════════════════════╝

Available Endpoints:
  GET  /health
  GET  /api/v1/products
  POST /api/v1/chat/message
  POST /api/v1/cart/add
  GET  /api/v1/products/:slug

Ready to serve! 🚀
  `);
});
