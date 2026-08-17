const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Extract available components from registry
const registryPath = path.join(__dirname, 'component-registry.js');
let availableComponents = [];
try {
  const content = fs.readFileSync(registryPath, 'utf8');
  const matches = content.match(/([A-Z][a-zA-Z0-9]*):\s*\{/g);
  if (matches) {
    availableComponents = matches.map(m => m.replace(':', '').replace('{', '').trim());
  }
} catch (e) {
  console.error('Error reading component registry for AI prompt:', e);
}

const SYSTEM_PROMPT = `
You are an expert AI assistant integrated into a visual drag-and-drop page builder called DropShip.
The user is interacting with you to modify their page layout.
The page layout is stored as a Craft.js serialized JSON tree.

You will receive:
1. The user's prompt (e.g., "make the button red", "add a hero section").
2. The CURRENT Craft.js serialized JSON state.
3. OPTIONALLY, a "selectedNodeId" and "selectedNodeName" indicating which component is currently selected on the canvas. When provided, the user is likely referring to THIS specific component when they say "this", "it", "the selected one", etc.

Your job is to understand the user's intent and modify the JSON state accordingly.

IMPORTANT RULES:
1. Return your response as a valid JSON object matching this schema:
   {
     "message": "A short conversational response acknowledging what you did.",
     "newState": { ... the entire updated Craft.js JSON state ... }
   }
2. The "newState" must be a valid Craft.js serialized state object (with node IDs as keys, and objects containing "type", "props", "nodes", "linkedNodes", "hidden", "isCanvas", etc.).
3. ONLY use the following available components when adding new nodes: ${availableComponents.join(', ')}.
4. When adding a new node, generate a unique string ID for it (e.g., "node_abc123").
5. If the user asks to clear the canvas or start from scratch, replace the tree with a root node and the requested structure.
6. Make sure to preserve existing nodes unless the user asks to delete or replace them. Just modify their "props" (like color, text, padding, etc.).
7. DO NOT include markdown formatting like \`\`\`json in your response. Output RAW JSON ONLY.
8. When a selectedNodeId is provided, prioritize modifications to that specific node unless the user explicitly refers to other components or the whole page.

Now, process the user's request.
`;

/**
 * Non-streaming version (kept as fallback)
 */
async function processAiChat(prompt, currentStateStr, selectedNodeId, selectedNodeName) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment.');
  }

  const aiModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  let userContent = `Current State:\n${currentStateStr}\n\n`;
  if (selectedNodeId) {
    userContent += `Currently Selected Component: ID="${selectedNodeId}", Name="${selectedNodeName || 'Unknown'}"\n\n`;
  }
  userContent += `User Request: ${prompt}`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: aiModel,
        messages: messages,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'DropShip AI Chatbot'
        }
      }
    );

    let content = response.data.choices[0].message.content;
    content = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      throw new Error("AI returned invalid JSON.");
    }
  } catch (error) {
    console.error("OpenRouter API error:", error.response ? error.response.data : error.message);
    throw new Error(error.response ? JSON.stringify(error.response.data) : error.message);
  }
}

/**
 * Streaming version — writes SSE chunks to the Express response
 */
async function processAiChatStream(prompt, currentStateStr, selectedNodeId, selectedNodeName, res) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment.');
  }

  const aiModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

  let userContent = `Current State:\n${currentStateStr}\n\n`;
  if (selectedNodeId) {
    userContent += `Currently Selected Component: ID="${selectedNodeId}", Name="${selectedNodeName || 'Unknown'}"\n\n`;
  }
  userContent += `User Request: ${prompt}`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userContent }
  ];

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: aiModel,
        messages: messages,
        response_format: { type: 'json_object' },
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'DropShip AI Chatbot'
        },
        responseType: 'stream'
      }
    );

    let fullContent = '';

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              // Stream each token to the client
              res.write(`data: ${JSON.stringify({ type: 'token', content: delta })}\n\n`);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    });

    response.data.on('end', () => {
      // Clean up and parse the full response
      let cleaned = fullContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        // Send the final parsed result
        res.write(`data: ${JSON.stringify({ type: 'done', message: parsed.message, newState: parsed.newState })}\n\n`);
      } catch {
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'AI returned invalid JSON. The response could not be applied.' })}\n\n`);
      }
      res.end();
    });

    response.data.on('error', (err) => {
      console.error("Stream error:", err);
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error("OpenRouter API error:", error.response ? error.response.data : error.message);
    const errMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    res.write(`data: ${JSON.stringify({ type: 'error', message: errMsg })}\n\n`);
    res.end();
  }
}

module.exports = {
  processAiChat,
  processAiChatStream
};
