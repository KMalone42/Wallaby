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
    
    // Function to simulate AI response
    function getAIResponse(userMessage) {
        // This would normally call an AI API
        const responses = [
            "That's an interesting question! Let me think about that for a moment.",
            "I understand what you're asking. Based on my knowledge, here's what I can tell you...",
            "Great question! Here's a detailed explanation of that concept.",
            "I've analyzed your query and here's my response to that topic.",
            "Thanks for asking! Here's what I know about that subject.",
            "That's a complex topic, but I'll do my best to explain it clearly."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return `${randomResponse} Regarding "${userMessage}", I can provide more detailed information if you'd like me to elaborate on any specific aspect.`;
    }
    
    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, true);
            messageInput.value = '';
            
            // Simulate AI thinking
            setTimeout(() => {
                const aiResponse = getAIResponse(message);
                addMessage(aiResponse);
            }, 1000);
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
