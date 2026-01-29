const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

let bedrockClient = null;

function getBedrockClient() {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return bedrockClient;
}

/**
 * Call AWS Bedrock AI - Claude Instant (cheapest option: $0.80/$2.40 per 1M tokens)
 */
async function callBedrockAI(prompt, history = []) {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS credentials not configured. Using fallback responses.');
      return null;
    }

    const client = getBedrockClient();
    let conversationContext = '';

    if (history && history.length > 0) {
      conversationContext = history.slice(-4).map(msg => {
        const role = msg.role === 'user' ? 'Human' : 'Assistant';
        return '\n\n' + role + ': ' + msg.content;
      }).join('');
    }

    const systemPrompt = 'You are an expert Vedic astrologer. Provide guidance on career, love, health, wealth, and gemstone recommendations based on Vedic astrology principles. Keep responses concise (2-3 paragraphs).';

    const fullPrompt = '\n\nHuman: ' + systemPrompt + conversationContext + '\n\nHuman: ' + prompt + '\n\nAssistant:';

    const modelId = 'anthropic.claude-instant-v1';
    const payload = {
      prompt: fullPrompt,
      max_tokens_to_sample: 500,
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return responseBody.completion.trim();
  } catch (error) {
    console.error('Bedrock AI Error:', error.message);
    return null;
  }
}

/**
 * Analyze Kundli (birth chart) using AI
 */
async function analyzeKundli(birthDetails) {
  const { name, dateOfBirth, timeOfBirth, placeOfBirth, gender } = birthDetails;

  const prompt = 'Analyze the Vedic birth chart (Kundli) for:\nName: ' + name + '\nDate of Birth: ' + dateOfBirth + '\nTime of Birth: ' + timeOfBirth + '\nPlace of Birth: ' + placeOfBirth + '\nGender: ' + (gender || 'Not specified') + '\n\nProvide a detailed Kundli analysis including:\n1. Ascendant (Lagna) and its significance\n2. Moon sign (Rashi) and emotional nature\n3. Sun sign and life purpose\n4. Key planetary positions and their effects\n5. Current planetary periods (Dasha)\n6. Favorable and unfavorable periods\n7. Recommended gemstones for planetary strength\n8. Career guidance based on 10th house\n9. Relationship prospects from 7th house\n10. Health indications from 6th house\n\nBe specific and provide actionable insights.';

  return await callBedrockAI(prompt, []);
}

module.exports = {
  callBedrockAI,
  analyzeKundli,
};
