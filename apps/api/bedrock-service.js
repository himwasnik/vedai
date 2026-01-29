const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize Bedrock client (uses AWS credential chain - same as your test!)
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

/**
 * Call AWS Bedrock AI - Claude 3 Haiku (same as your working test!)
 * Uses the new Claude 3 Messages API format
 */
async function callBedrockAI(userMessage, history = []) {
  try {
    // Build conversation messages
    const messages = [];

    // Add history
    if (history && history.length > 0) {
      history.slice(-4).forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: [{ type: 'text', text: msg.content }]
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: [{ type: 'text', text: userMessage }]
    });

    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: 'You are an expert Vedic astrologer. Provide guidance on career, love, health, wealth, and gemstone recommendations based on Vedic astrology. Keep responses concise (2-3 paragraphs).',
      messages: messages,
    });

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body,
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));

    return responseBody.content[0].text;
  } catch (error) {
    console.error('Bedrock AI Error:', error.message);
    return null;
  }
}

/**
 * Analyze Kundli using AI - sends all form data to Claude
 */
async function analyzeKundli(birthDetails) {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender } = birthDetails;

  const prompt = `Analyze the Vedic birth chart (Kundli) for:

Name: ${name}
Date of Birth: ${dateOfBirth}
Time of Birth: ${timeOfBirth}
Place of Birth: ${placeOfBirth}
Gender: ${gender || 'Not specified'}

Provide a detailed Kundli analysis including:

1. **Ascendant (Lagna)**: Rising sign and its significance for life path
2. **Moon Sign (Rashi)**: Emotional nature and mind
3. **Sun Sign**: Life purpose and soul expression
4. **Planetary Positions**: Key planets and their effects on different life areas
5. **Current Dasha Period**: Active planetary period and its influence
6. **Favorable Periods**: Best times for important decisions and actions
7. **Career Guidance**: Professional path based on 10th house
8. **Relationship Prospects**: Marriage and partnerships from 7th house
9. **Health Indications**: Physical and mental health from 6th house
10. **Gemstone Recommendations**: Which gemstones will strengthen beneficial planets

Be specific, compassionate, and provide actionable insights based on Vedic astrology principles.`;

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system: 'You are an expert Vedic astrologer with deep knowledge of birth chart analysis, planetary positions, and their effects on human life.',
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: prompt }]
      }
    ],
  });

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body,
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));

    return responseBody.content[0].text;
  } catch (error) {
    console.error('Kundli Analysis Error:', error.message);
    return null;
  }
}

module.exports = {
  callBedrockAI,
  analyzeKundli,
};
