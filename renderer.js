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
    function getAPIEndpoint() {
        // This would normally read from settings
        // For now, we'll use a default value and prompt if needed
        const savedEndpoint = localStorage.getItem('ollamaEndpoint');
        if (!savedEndpoint) {
            const endpoint = prompt('Please enter your Ollama API endpoint (e.g., http://localhost:11434):');
            if (endpoint) {
                localStorage.setItem('ollamaEndpoint', endpoint);
                return endpoint;
            } else {
                // If no endpoint provided, use default
                return 'http://localhost:11434';
            }
        }
        return savedEndpoint;
    }
    
    // Function to call Ollama API
    async function callOllamaAPI(prompt) {
        try {
            const endpoint = getAPIEndpoint();
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
});
