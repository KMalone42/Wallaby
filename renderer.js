// renderer.js
import { ipcRenderer } from 'electron';

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const time = new Date();
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    document.querySelector('.chat-container').appendChild(messageDiv);
    
    // Scroll to bottom
    document.querySelector('.chat-container').scrollTop = document.querySelector('.chat-container').scrollHeight;
}

async function getAPIEndpoint() {
    try {
        // Ensure settings is available
        if (typeof window.settings === 'undefined') {
            console.error('Settings API is not available');
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
        return 'http://localhost:11434';
    }
}

async function callOllamaAPI(prompt) {
    try {
        const endpoint = await getAPIEndpoint();
        const response = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama2', // Default model, can be made configurable
                prompt: prompt,
                stream: false,
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error calling Ollama API:', error);
        throw error;
    }
}

async function sendMessage() {
    const message = document.getElementById('message-input').value.trim();
    if (message) {
        // Add user message
        addMessage(message, true);
        document.getElementById('message-input').value = '';
        
        // Show thinking indicator
        const thinkingMessage = addMessage("Thinking...", false);
        
        try {
            const response = await callOllamaAPI(message);
            // Remove thinking indicator
            document.querySelector('.chat-container').removeChild(thinkingMessage);
            // Add AI response
            addMessage(response, false);
        } catch (error) {
            // Remove thinking indicator
            document.querySelector('.chat-container').removeChild(thinkingMessage);
            // Add error message
            addMessage(`Error: ${error.message}`, false);
        }
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
    document.getElementById('send-button').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Set up settings button
    document.getElementById('settings-button').addEventListener('click', () => {
        // Navigate to settings page
        window.location.href = 'settings.html';
    });
    
    // Add initial welcome message
    setTimeout(() => {
        addMessage("Hello! I'm your AI assistant. How can I help you today?");
    }, 500);
});
