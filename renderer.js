document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatContainer = document.querySelector('.chat-container');
    
    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const time = new Date();
        const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // Function to get API endpoint from settings
    async function getAPIEndpoint() {
        try {
            // Ensure settings is available
            if (typeof window.settings === 'undefined') {
                console.error('Settings API is not available');
                return 'http://localhost:11434';
            }
            
            // Try to get endpoint from settings
            const savedEndpoint = await window.settings.getOllamaBaseUrl();
            if (savedEndpoint) {
                return savedEndpoint;
            } else {
                // If no endpoint provided, use default
                return 'http://localhost:11434';
            }
        } catch (error) {
            console.error('Error getting API endpoint:', error);
            return 'http://localhost:11434';
        }
    }
    
    // Function to call Ollama API
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
                    stream: false
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling Ollama API:', error);
            return "Sorry, I encountered an error while processing your request. Please check your API endpoint and try again.";
        }
    }
    
    // Send message function
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, true);
            messageInput.value = '';
            
            // Show thinking indicator
            const thinkingMessage = addMessage("Thinking...", false);
            
            try {
                // Call Ollama API
                const aiResponse = await callOllamaAPI(message);
                // Remove thinking indicator and add actual response
                chatContainer.removeChild(thinkingMessage);
                addMessage(aiResponse);
            } catch (error) {
                // Remove thinking indicator and show error
                chatContainer.removeChild(thinkingMessage);
                addMessage("Error: Could not get response from AI. Please check your API settings.");
            }
        }
    }
    
    // Function to show popup
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
        popup.style.padding = '30px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        popup.style.textAlign = 'center';
        popup.style.maxWidth = '500px';
        popup.style.width = '80%';
        popup.style.position = 'relative';
        
        // Add message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '20px';
        messageElement.style.fontSize = '16px';
        messageElement.style.lineHeight = '1.5';
        
        // Add acknowledge button
        const acknowledgeButton = document.createElement('button');
        acknowledgeButton.textContent = 'OK';
        acknowledgeButton.style.padding = '10px 20px';
        acknowledgeButton.style.backgroundColor = '#4b6cb7';
        acknowledgeButton.style.color = 'white';
        acknowledgeButton.style.border = 'none';
        acknowledgeButton.style.borderRadius = '5px';
        acknowledgeButton.style.cursor = 'pointer';
        acknowledgeButton.style.fontWeight = 'bold';
        acknowledgeButton.style.transition = 'background-color 0.3s';
        
        acknowledgeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        acknowledgeButton.addEventListener('mouseenter', () => {
            acknowledgeButton.style.backgroundColor = '#3a5795';
        });
        
        acknowledgeButton.addEventListener('mouseleave', () => {
            acknowledgeButton.style.backgroundColor = '#4b6cb7';
        });
        
        popup.appendChild(messageElement);
        popup.appendChild(acknowledgeButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Disable chat functionality
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // Re-enable when popup is closed
        acknowledgeButton.addEventListener('click', () => {
            messageInput.disabled = false;
            sendButton.disabled = false;
        });
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add initial welcome message
    setTimeout(() => {
        addMessage("Hello! I'm your AI assistant. How can I help you today?");
    }, 500);
    
    // Example usage of popup (can be called from anywhere)
    // showPopup("This is a test notification!");


    // renderer.js
(async () => {
  const theme = await window.settings.getTheme();
  document.documentElement.dataset.theme = theme; // or apply a class
})();

// when user toggles:
document.querySelector('#darkModeToggle').addEventListener('change', (e) => {
  window.settings.setTheme(e.target.checked ? 'dark' : 'light');
});

});
