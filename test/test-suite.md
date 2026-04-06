# Wallaby Test Suite

## Overview
Comprehensive test suite for the Wallaby Electron chat application.

## Directory Structure
```
test/
├── suite.js           # Test runner configuration
├── setup.js           # Test setup and fixtures
├── teardown.js        # Test cleanup
├── fixtures/
│   ├── sample-prompt.md
│   ├── test-images/
│   └── mock-ollama.json
├── unit/
│   ├── chat.test.js
│   ├── settings.test.js
│   ├── file-storage.test.js
│   ├── message-rendering.test.js
│   └── input-handling.test.js
├── integration/
│   ├── ollama-api.test.js
│   ├── image-attachment.test.js
│   ├── fullscreen.test.js
│   └── ipc.test.js
├── e2e/
│   ├── chat-flow.test.js
│   ├── settings-flow.test.js
│   └── attachment-flow.test.js
└── features/
    ├── top_k.test.js
    ├── top_p.test.js
    ├── ocr.test.js
    └── format.test.js
```

---

## Test Suite: suite.js


## Test Suite: setup.js


## Test Suite: unit/chat.test.js


## Test Suite: unit/settings.test.js


## Test Suite: unit/file-storage.test.js


## Test Suite: integration/ollama-api.test.js


## Test Suite: e2e/chat-flow.test.js


## Test Suite: features/ocr.test.js

```javascript

---

## Run Commands

```bash
# Install dependencies
npm install --save-dev jest jsdom

# Run all tests
npm test

# Run specific test file
npm test -- test/unit/chat.test.js

# Run future feature tests
npm test -- test/features/ocr.test.js

# Run with coverage
npm run test:coverage
```

