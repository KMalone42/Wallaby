const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { exec } = require('child_process');

// Test runner configuration
const TESTS = [
  // Unit tests
  './unit/chat.test.js',
  './unit/settings.test.js',
  './unit/file-storage.test.js',
  './unit/message-rendering.test.js',
  './unit/input-handling.test.js',
  
  // Integration tests
  './integration/ollama-api.test.js',
  './integration/image-attachment.test.js',
  './integration/fullscreen.test.js',
  './integration/ipc.test.js',
  
  // E2E tests
  './e2e/chat-flow.test.js',
  './e2e/settings-flow.test.js',
  './e2e/attachment-flow.test.js',
  
  // Future feature tests
  './features/top_k.test.js',
  './features/top_p.test.js',
  './features/ocr.test.js',
  './features/format.test.js',
];

// Run all tests
TESTS.forEach(file => {
  describe(file, () => {
    exec(`node ${file}`, { encoding: 'utf8' });
  });
});

console.log('\n🔮 All tests completed');
