# Ollama API Feature Checklist

## Currently Implemented Features

| Feature | Status | Notes |
|---------|--------|-------|
| `model` | ✅ Implemented | Retrieved from settings |
| `prompt` | ✅ Implemented | User message input |
| `stream` | ✅ Implemented | Set to `false` (non-streaming) |
| `temperature` | ✅ Implemented | Retrieved from settings |
| `max_tokens` | ✅ Implemented | Mapped from `maxTokens` setting |

## Missing Features

| Feature | Status | Notes |
|---------|--------|-------|
| `suffix` | ❌ Not Implemented | Fill-in-the-middle text support |
| `images` | ❌ Not Implemented | Image input support |
| `format` | ❌ Not Implemented | Structured output (JSON schema) support |
| `system` | ❌ Not Implemented | System prompt support |
| `think` | ❌ Not Implemented | Thinking output support |
| `raw` | ❌ Not Implemented | Raw response without templating |
| `keep_alive` | ❌ Not Implemented | Model keep-alive duration |
| `logprobs` | ❌ Not Implemented | Log probability information |
| `top_logprobs` | ❌ Not Implemented | Top log probabilities |
| `options` | ⚠️ Partial | Only `temperature` and `max_tokens` used |
| `seed` | ❌ Not Implemented | Random seed for reproducibility |
| `top_k` | ❌ Not Implemented | Token selection limit |
| `top_p` | ❌ Not Implemented | Nucleus sampling threshold |
| `min_p` | ❌ Not Implemented | Minimum probability threshold |
| `stop` | ❌ Not Implemented | Stop sequences |
| `num_ctx` | ❌ Not Implemented | Context length size |
| `num_predict` | ❌ Not Implemented | Maximum tokens to generate |

## Recommendations

1. **Add `system` prompt support** - Useful for setting model behavior/context
2. **Add `format` support** - Enable structured JSON output for data extraction
3. **Add `images` support** - Enable multimodal models (if available)
4. **Add `options` object** - Allow users to configure `top_k`, `top_p`, `seed`, etc.
5. **Add `keep_alive` setting** - Control model loading/unloading behavior
6. **Add `stop` sequences** - Control response length and content
7. **Add `num_predict`** - Override default token limits

## API Reference

See: https://docs.ollama.com/api/generate

