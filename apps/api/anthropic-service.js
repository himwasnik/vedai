require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');

/**
 * Call Anthropic API for chat and Kundli analysis
 * Uses Claude model via Anthropic's API
 */
async function callAnthropicAPI(prompt, systemPrompt = '') {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not found in environment');
    return null;
  }

  console.log('Loaded API Key:', apiKey); // Debug log to confirm API Key is loaded

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Cheapest Claude 3 model
        max_tokens: 1024,
        system: systemPrompt || 'You are an expert Vedic astrologer providing guidance on astrology, gemstones, and spiritual matters.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API Error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Anthropic API:', error.message);
    return null;
  }
}

/**
 * Chat with AI using conversation history
 */
async function chatWithAI(message, history = []) {
  // Build conversation context
  let conversationContext = '';
  if (history && history.length > 0) {
    conversationContext = history
      .slice(-4)
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');
  }

  const fullPrompt = conversationContext
    ? `${conversationContext}\n\nUser: ${message}\n\nAssistant:`
    : message;

  const systemPrompt = `You are an expert Vedic astrologer AI assistant. Provide guidance on:
- Career and professional success
- Love, relationships, and marriage
- Health and wellness
- Wealth and prosperity
- Gemstone recommendations based on Vedic astrology
- Birth chart (Kundli) analysis

Keep responses concise (2-3 paragraphs). Be compassionate and helpful.`;

  return await callAnthropicAPI(fullPrompt, systemPrompt);
}

/**
 * Analyze Kundli using AI
 */
async function analyzeKundliWithAI(birthDetails) {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender } = birthDetails;

  const prompt = `Analyze the Vedic birth chart (Kundli) for:

Name: ${name}
Date of Birth: ${dateOfBirth}
Time of Birth: ${timeOfBirth}
Place of Birth: ${placeOfBirth}
Gender: ${gender || 'Not specified'}

Provide a detailed Kundli analysis including:
1. **Ascendant (Lagna)**: Rising sign and its significance
2. **Moon Sign (Rashi)**: Emotional nature and mind
3. **Sun Sign**: Life purpose and soul
4. **Planetary Positions**: Key planets and their effects
5. **Current Dasha Period**: Which planetary period is active
6. **Favorable Periods**: Best times for important decisions
7. **Career Guidance**: Based on 10th house
8. **Relationship Prospects**: From 7th house
9. **Health Indications**: From 6th house
10. **Gemstone Recommendations**: Which gemstones will strengthen beneficial planets

Be specific and provide actionable insights in a warm, compassionate tone.`;

  const systemPrompt = `You are an expert Vedic astrologer with deep knowledge of birth chart analysis. Provide detailed, accurate, and helpful Kundli readings.`;

  return await callAnthropicAPI(prompt, systemPrompt);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API endpoint to handle product creation
router.post('/products', upload.single('image'), (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !description || !price) {
    return res.status(400).json({ error: 'All fields are required except image.' });
  }

  // Simulate saving product to database
  const newProduct = {
    id: Date.now(),
    name,
    description,
    price,
    image,
  };

  console.log('Product saved:', newProduct);

  res.status(201).json({ message: 'Product created successfully', product: newProduct });
});

module.exports = {
  callAnthropicAPI,
  chatWithAI,
  analyzeKundliWithAI,
};
