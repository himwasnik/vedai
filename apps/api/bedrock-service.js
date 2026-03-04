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
    // Validate user message
    if (!userMessage || userMessage.trim() === '') {
      console.warn('Warning: Empty user message provided to Bedrock');
      return null;
    }

    // Build conversation messages
    const messages = [];

    // Add history
    if (history && history.length > 0) {
      history.slice(-4).forEach(msg => {
        if (msg.content && msg.content.trim() !== '') {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      });
    }

    // Add current message (must use user role)
    messages.push({
      role: 'user',
      content: userMessage.trim()
    });

    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      system: `You are a warm, experienced Vedic astrologer with 20+ years of practice. Chat like a REAL person - short sentences, natural flow:
      - Write SHORT responses (2-4 lines usually)
      - Use Hinglish naturally (English + Hindi mix): "Haan beta", "Bilkul", "Dekho", "Acha sunao", "Theek hai na"
      - Show warmth and genuine care
      - Ask simple questions to understand them better
      - Give practical, conversational advice
      - Like chatting with a friend over chai, not a lecture
      - Use casual language: "You know what...", "Dekho na...", "So basically..."
      - NO long paragraphs - break into natural chat pieces
      - NO lists or formal structure
      - Respond to what they actually ask, don't over-explain
      - Remember: natural Indian astrologer talking, not formal writing`,
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

  const prompt = `Kundli reading for:
Name: ${name}
Date: ${dateOfBirth} | Time: ${timeOfBirth} | Place: ${placeOfBirth}
Gender: ${gender || 'Not specified'}

Chat with them naturally about their chart. Tell their story in a warm, conversational way:
- What kind of person they are based on their planets
- What's happening in their life right now
- What to watch out for / what's coming
- Which gemstones would help them
- Practical tips they can use today

IMPORTANT: Keep it conversational! Like talking over chai:
- Use Hinglish mix naturally ("haan", "beta", "dekho", "bilkul")
- SHORT sentences and paragraphs
- Tell their story, don't lecture
- Ask them about what matters to them
- Be warm and genuinely caring
- NO numbered lists, NO formal structure
- Flow like a real conversation
- Mix practical advice with cosmic wisdom`;

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2048,
    system: `You are an experienced, warm Vedic astrologer - speak like a REAL person chatting:
    - SHORT responses (usually 2-4 lines)
    - Hinglish naturally: mix English + Hindi ("haan beta", "bilkul", "dekho", "theek hai", "sun suno")
    - Conversational and warm - like talking over chai
    - Ask simple questions, don't lecture
    - Give practical, usable advice
    - Tell their story naturally - NO lists
    - Show genuine care and emotion
    - Use casual phrases: "You know...", "So basically...", "See what happens..."
    - Respond to what they ask, don't over-explain
    - Be their friend and guide, not a textbook
    - Remember: real person to person conversation`,
    messages: [
      {
        role: 'user',
        content: prompt
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
