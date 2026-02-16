// index.page.js

async function updateHeaderTitle() {
  try {
    const model = await window.settings.getModel();
    const endpoint = await window.settings.getOllamaBaseUrl();

    let hostname = "hostname";
    let modelName = "model";

    if (endpoint) {
      const match = endpoint.match(/\/\/([^:]+)/);
      if (match && match[1]) {
        hostname = match[1];
      }
    }

    if (model) {
      modelName = model.split(":")[0]; // drop :latest etc
    }

    const titleElement = document.getElementById("chat-title");
    if (titleElement) {
      titleElement.textContent = `${modelName}@${hostname}`;
    }

  } catch (err) {
    console.error("Failed to update header title:", err);
  }
}

// Handles all message rendering basically, uses commonmark and dompurify
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;

  const time = new Date();
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  if (isUser) {
    contentDiv.textContent = content; // user = plain text
  } else {
    contentDiv.innerHTML = window.markdown.render(content); // AI = markdown -> safe html
  }

  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = timeString;

  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);

  const chat = document.querySelector('.chat-container');
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;

  return messageDiv;
}



// Cache for settings to avoid repeated API calls
let cachedSettings = null;
let settingsLoaded = false;

async function getSettings() {
  if (settingsLoaded && cachedSettings) {
    return cachedSettings;
  }

    let settings;

    try {
        settings = {
            ollamaBaseUrl: await window.settings.getOllamaBaseUrl(),
            model: await window.settings.getModel(),
            temperature: await window.settings.getTemperature(),
            maxTokens: await window.settings.getMaxTokens()
        };
        console.log('Fetched endpoint:', settings.ollamaBaseUrl);
        console.log('Fetched model:', settings.model);
        console.log('Fetched temperature:', settings.temperature);
        console.log('Fetched maxTokens:', settings.maxTokens);
    }
    catch (error) {
        console.error('Error getting settings:', error);
        // Return defaults if settings API fails
        return {
          ollamaBaseUrl: 'http://localhost:11434',
          model: 'llama2',
          temperature: 0.7,
          maxTokens: 1000
        };
    }
    cachedSettings = settings;
    settingsLoaded = true;
    return settings;
}

async function callOllamaAPI(prompt) {
    try {
        const settings = await getSettings();
        console.log('Using endpoint:', settings.ollamaBaseUrl);
        console.log('Using model:', settings.model);
        console.log('Using temperature:', settings.temperature);
        console.log('Using maxTokens:', settings.maxTokens);
        
        const response = await fetch(`${settings.ollamaBaseUrl}/api/generate`, {
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

// Triggers toolchain
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
    // Setup header
    updateHeaderTitle();

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
        addMessage("This is the beginning of a new chat.");
    }, 500);
});
