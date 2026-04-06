// Test setup and fixtures
const fs = require('fs');
const path = require('path');

// Create fixtures directory if it doesn't exist
const fixturesDir = path.join(__dirname, '..', 'fixtures');
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// Create mock Ollama response
const mockResponse = {
  response: 'This is a sample response from the Ollama API.\n\nIt supports:\n- Markdown formatting\n- Code blocks\n- Lists\n\n**Features available:**\n1. Temperature: 0.7\n2. Max tokens: 1000\n3. Images: Supported\n\n---\n\n*This is a test response.*',
  done: true
};

fs.writeFileSync(
  path.join(fixturesDir, 'mock-ollama.json'),
  JSON.stringify(mockResponse, null, 2)
);

console.log('✅ Test fixtures initialized');
