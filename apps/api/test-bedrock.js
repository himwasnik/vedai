// Quick test to verify Bedrock integration works
require('dotenv').config();
const { callBedrockAI, analyzeKundli } = require('./bedrock-service');

async function testChat() {
  console.log('\n🧪 Testing Chat with Bedrock AI...\n');

  const response = await callBedrockAI('Tell me about career success in astrology');

  if (response) {
    console.log('✅ Chat AI Response:');
    console.log(response);
  } else {
    console.log('❌ Chat failed - will use fallback');
  }
}

async function testKundli() {
  console.log('\n🧪 Testing Kundli Analysis with Bedrock AI...\n');

  const analysis = await analyzeKundli({
    name: 'Test User',
    dateOfBirth: '1990-01-15',
    timeOfBirth: '10:30',
    placeOfBirth: 'Mumbai, India',
    gender: 'male'
  });

  if (analysis) {
    console.log('✅ Kundli AI Response:');
    console.log(analysis.substring(0, 300) + '...');
  } else {
    console.log('❌ Kundli failed - will use fallback');
  }
}

async function runTests() {
  await testChat();
  await testKundli();
  console.log('\n✅ Tests complete!\n');
}

runTests().catch(console.error);
