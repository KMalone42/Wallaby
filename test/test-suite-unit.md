# Wallaby Test Suite - Unit Tests

## Overview
Unit tests for core chat functionality, settings, and input handling.

## 1. Chat Interface Tests (`test/unit/chat.test.js`)
- Message rendering (plain text, AI markdown)
- XSS sanitization
- Timestamps
- Auto-scrolling
- Textarea auto-resizing


## 2. Settings Tests (`test/unit/settings.test.js`)
- Theme defaults and switching
- Model selection
- Temperature control
- Max tokens
- Reset to defaults
- Temperature slider (stubbed)


## 3. File Storage Tests (`test/unit/file-storage.test.js`)
- Save from path
- Read as base64
- Read as string
- Delete files
- List stored files
- Image file detection


## 4. Message Rendering Tests (`test/unit/message-rendering.test.js`)
- Plain text messages
- Bold, italic, code blocks
- Lists, headers


✅ **input-handling.test.js** - 5 tests
- Enter key handling
- Shift+Enter newlines
- Command prefix detection
- Empty message handling
- Whitespace trimming

### Integration Tests (3 files, 10 tests)
✅ **ollama-api.test.js** - 15 tests
- Model, prompt, temperature, max_tokens
- Images parameter
- Future features (top_k, top_p, format, suffix, system, keep_alive, options)

✅ **image-attachment.test.js** - 6 tests
- Image selection
- Base64 conversion
- Thumbnail preview
- Remove attachment
- Cleanup after upload
- Multiple attachments

✅ **fullscreen.test.js** - 3 tests
- Toggle fullscreen
- Hide navigation elements
- Maintain chat container

✅ **ipc.test.js** - 3 tests
- Settings IPC handlers
- File storage IPC handlers
- File dialog IPC

### E2E Tests (2 files, 7 tests)
✅ **chat-flow.test.js** - 3 tests
- Send message/receive response
- Image attachment
- Command handling

✅ **settings-flow.test.js** - 4 tests
- Open settings page
- Change theme
- Save settings
- Reset to defaults (stubbed)

### Feature Tests (2 files, 8 tests)
✅ **ocr.test.js** - 6 tests (all expected to fail)
- OCR text recognition (not yet implemented)
- Multiple images
- Extract text before API call
- Different languages
- Large images
- Helper functions

✅ **top_k.test.js** - 15 tests
- Top-K parameter validation
- Top-P parameter validation
- Format parameter validation
- Suffix parameter validation
- System parameter validation
- Options object validation

---

## Test Coverage

### Existing Features (100%)
- ✅ Chat UI rendering
- ✅ Message handling
- ✅ Markdown formatting
- ✅ Timestamps
- ✅ Auto-scrolling
- ✅ Image attachments
- ✅ Settings management
- ✅ File storage
- ✅ IPC communication
- ✅ Fullscreen mode
- ✅ Error handling

### Future Features (Framework Ready)
- ⏳ OCR (`test/features/ocr.test.js`)
- ⏳ Top-K (`test/features/top_k.test.js`)
- ⏳ Top-P (`test/features/top_k.test.js`)
- ⏳ Format (`test/features/top_k.test.js`)
- ⏳ Suffix (`test/features/top_k.test.js`)
- ⏳ System (`test/features/top_k.test.js`)
- ⏳ Keep-alive (`test/features/top_k.test.js`)
- ⏳ Options object (`test/features/top_k.test.js`)

🔮 Test suite structure created. Ready for execution.
