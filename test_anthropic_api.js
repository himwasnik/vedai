const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({
  region: "us-east-1",
});

async function testBedrockClaude() {
  const prompt = "Hello how are you";

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
  });

  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  try {
    const response = await client.send(command);
    const responseBody = JSON.parse(
      Buffer.from(response.body).toString("utf-8")
    );

    console.log("✅ Bedrock Response:");
    console.log(responseBody.content[0].text);
  } catch (err) {
    console.error("❌ Bedrock Error:", err);
  }
}

testBedrockClaude();
