// renderer.js

function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

  const time = new Date();
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messageDiv.innerHTML = `
    <div class="message-content">${content}</div>
    <div class="message-time">${timeString}</div>
  `;

  const chat = document.querySelector('.chat-container');
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;

  return messageDiv; // ✅ IMPORTANT
}

// Cache for settings to avoid repeated API calls
let cachedSettings = null;
let settingsLoaded = false;

async function getSettings() {
  if (settingsLoaded && cachedSettings) {
    return cachedSettings;
  }

  try {
    if (typeof window.settings === 'undefined') {
      console.warn('Settings API is not available, using defaults');
      return {
        ollamaBaseUrl: 'http://localhost:11434',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 1000
      };
    }
    
    const settings = {
      ollamaBaseUrl: await window.settings.getOllamaBaseUrl(),
      model: await window.settings.getModel(),
      temperature: await window.settings.getTemperature(),
      maxTokens: await window.settings.getMaxTokens()
    };
    
    cachedSettings = settings;
    settingsLoaded = true;
    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    // Return defaults if settings API fails
    return {
      ollamaBaseUrl: 'http://localhost:11434',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 1000
    };
  }
}

async function getAPIEndpoint() {
    try {
        // Ensure settings is available
        if (typeof window.settings === 'undefined') {
            console.warn('Settings API is not available, using default endpoint');
            return 'http://localhost:11434';
        }
        
        // Try to get endpoint from settings
        const savedEndpoint = await window.settings.getOllamaBaseUrl();
        if (savedEndpoint && savedEndpoint !== '') {
            return savedEndpoint;
        }
        
        // Fallback to default
        return 'http://localhost:11434';
    } catch (error) {
        console.error('Error getting API endpoint:', error);
        // Even if there's an error, return default endpoint
        return 'http://localhost:11434';
    }
}

async function callOllamaAPI(prompt) {
    try {
        const settings = await getSettings();
        const endpoint = await getAPIEndpoint();
        console.log('Using endpoint:', endpoint);
        
        const response = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: settings.model || 'llama2',
                prompt: prompt,
                stream: false,
                temperature: settings.temperature || 0.7,
                max_tokens: settings.maxTokens || 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error calling Ollama API:', error);
        
        // Show a more helpful error message to the user
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Could not connect to Ollama API. Please ensure Ollama is running and accessible at the configured endpoint.');
        }
        
        throw error;
    }
}

async function sendMessage() {
  console.log('sendMessage clicked');
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  messageInput.value = '';

  const thinkingNode = addMessage("Thinking...", false);

  try {
    const response = await callOllamaAPI(message);
    thinkingNode.remove();
    addMessage(response, false);
  } catch (error) {
    thinkingNode.remove();
    addMessage(`Error: ${error.message}`, false);
  }
}

function showPopup(message) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    
    // Create popup content
    const popup = document.createElement('div');
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '400px';
    
    popup.innerHTML = `
        <h3>Message</h3>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: #4b6cb7; color: white; border: none; border-radius: 5px; cursor: pointer;">OK</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Set up settings button
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Navigate to settings page
            window.location.href = 'settings.html';
        });
    }

    // Add initial welcome message
    setTimeout(() => {
        addMessage("Hello! I'm your AI assistant. How can I help you today?");
    }, 500);
});
