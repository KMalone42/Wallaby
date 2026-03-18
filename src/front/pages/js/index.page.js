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

// Convert image file to base64
async function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Handle image upload and message sending
async function handleImageMessage(images, message) {
  if (!message) {
    message = "Here is an image:";
  }

  // Convert images to base64
  const base64Images = [];
  for (const img of images) {
    try {
      const base64 = await imageToBase64(img);
      base64Images.push(base64);
    } catch (error) {
      console.error('Error converting image:', error);
      throw new Error('Failed to process image');
    }
  }

  // Add message with images
  const messageDiv = addMessage(message, true);

  // Add image previews
  for (const base64 of base64Images) {
    const imgDiv = document.createElement('div');
    imgDiv.className = 'message-image';
    imgDiv.innerHTML = `
      <img src="${base64}" alt="Uploaded image">
      <p>Image attached</p>
    `;
    messageDiv.appendChild(imgDiv);
  }

  return base64Images;
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

async function callOllamaAPI(prompt, images = []) {
    try {
        const settings = await getSettings();
        console.log('Using endpoint:', settings.ollamaBaseUrl);
        console.log('Using model:', settings.model);
        console.log('Using temperature:', settings.temperature);
        console.log('Using maxTokens:', settings.maxTokens);
        console.log('Using images:', images.length);
        
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
                max_tokens: settings.maxTokens || 1000,
                images: images.length > 0 ? images : undefined
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
  
  // Get attached images from attach-container
  const attachContainer = document.querySelector('.attach-container');
  const attachedImages = [];
  
  // Remove existing attachments
  const existingAttachments = attachContainer.querySelectorAll('.attachment-preview');
  existingAttachments.forEach(attachment => attachment.remove());
  
  // Clear the message input if no text
  if (!message) {
    message = '';
  }
  
  if (!message) return;

  addMessage(message, true);
  messageInput.value = '';

  // Get any attached images from the attach-container
  const attachmentPreviews = attachContainer.querySelectorAll('.attachment-preview');
  for (const attachment of attachmentPreviews) {
    const imgElement = attachment.querySelector('img');
    if (imgElement) {
      attachedImages.push(imgElement.src);
    }
  }

  // Extract text from images if any are attached
  let imageText = '';
  if (attachedImages.length > 0) {
    try {
      imageText = await extractTextFromImages(attachedImages);
      console.log('Extracted text from images:', imageText);
      
      // Append extracted text to the message prompt
      if (imageText.trim()) {
        const promptWithImages = `${message}\n\nExtracted text from images:\n${imageText}`;
        console.log('Sending prompt with image text:', promptWithImages);
        
        // Use the combined prompt for the API call
        const response = await callOllamaAPI(promptWithImages, attachedImages);
        thinkingNode.remove();
        addMessage(response, false);
      } else {
        // No text extracted, send original message with images
        const response = await callOllamaAPI(message, attachedImages);
        thinkingNode.remove();
        addMessage(response, false);
      }
    } catch (error) {
      console.error('Error extracting text from images:', error);
      // If extraction fails, send original message with images
      const response = await callOllamaAPI(message, attachedImages);
      thinkingNode.remove();
      addMessage(response, false);
    }
  } else {
    // No images attached, send message as normal
    const thinkingNode = addMessage("Thinking...", false);

    try {
      const response = await callOllamaAPI(message, attachedImages);
      thinkingNode.remove();
      addMessage(response, false);
    } catch (error) {
      thinkingNode.remove();
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
    // Setup header
    updateHeaderTitle();

    // Set up event listeners
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    const messageInput = document.getElementById('message-input');

    function autosize(el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 160) + "px"; // 160px cap
    }

    messageInput.addEventListener("input", () => autosize(messageInput));
    autosize(messageInput);

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

// File selection handling
let selectedFile = null;

onMainEvent('file-selected', (filePath) => {
  console.log('File selected:', filePath);
  selectedFile = filePath;

  const fileDisplay = document.getElementById('file-display');
  if (fileDisplay) {
    fileDisplay.innerText = `You selected: ${filePath}`;
  }

  // Create thumbnail preview in attach-container
  const attachContainer = document.querySelector('.attach-container');
  if (attachContainer) {
    // Check if this is an image file
    const fileExtension = filePath.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    
    if (imageExtensions.includes(fileExtension)) {
      // Create attachment preview element
      const attachmentPreview = document.createElement('div');
      attachmentPreview.className = 'attachment-preview';
      attachmentPreview.style.display = 'inline-block';
      attachmentPreview.style.margin = '5px';
      attachmentPreview.style.border = '1px solid #ccc';
      attachmentPreview.style.borderRadius = '5px';
      attachmentPreview.style.padding = '5px';
      attachmentPreview.style.background = '#f5f5f5';
      attachmentPreview.style.position = 'relative';

      
      // Create image element for thumbnail
      const img = document.createElement('img');
      img.src = filePath;
      img.style.maxWidth = '100px';
      img.style.maxHeight = '100px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '3px';
      
      // Create remove button
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '2px';
      removeBtn.style.right = '2px';
      removeBtn.style.background = 'red';
      removeBtn.style.color = 'white';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '20px';
      removeBtn.style.height = '20px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontSize = '14px';
      removeBtn.style.lineHeight = '1';
      removeBtn.style.display = 'flex';
      removeBtn.style.alignItems = 'center';
      removeBtn.style.justifyContent = 'center';
      
      removeBtn.addEventListener('click', () => {
        attachmentPreview.remove();
      });
      
      attachmentPreview.appendChild(img);
      attachmentPreview.appendChild(removeBtn);
      attachContainer.appendChild(attachmentPreview);
    } else {
      // For non-image files, show text preview
      const attachmentPreview = document.createElement('div');
      attachmentPreview.className = 'attachment-preview';
      attachmentPreview.style.display = 'inline-block';
      attachmentPreview.style.margin = '5px';
      attachmentPreview.style.border = '1px solid #ccc';
      attachmentPreview.style.borderRadius = '5px';
      attachmentPreview.style.padding = '5px';
      attachmentPreview.style.background = '#f5f5f5';
      
      const text = document.createElement('span');
      text.textContent = `📎 ${filePath.split('/').pop()}`;
      text.style.fontSize = '12px';
      text.style.color = '#666';
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '2px';
      removeBtn.style.right = '2px';
      removeBtn.style.background = 'red';
      removeBtn.style.color = 'white';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '20px';
      removeBtn.style.height = '20px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontSize = '14px';
      removeBtn.style.lineHeight = '1';
      removeBtn.style.display = 'flex';
      removeBtn.style.alignItems = 'center';
      removeBtn.style.justifyContent = 'center';
      
      removeBtn.addEventListener('click', () => {
        attachmentPreview.remove();
      });
      
      attachmentPreview.appendChild(text);
      attachmentPreview.appendChild(removeBtn);
      attachContainer.appendChild(attachmentPreview);
    }
  }

  showPopup(`File selected: ${filePath}`);
});

const openFileDialog = () => {
  console.log('Opening file dialog');
  api.send('open-file-dialog', null);
};

document.getElementById('attach-button')?.addEventListener('click', openFileDialog);
document.getElementById('select-file-btn')?.addEventListener('click', openFileDialog);


async function extractTextFromImages(images) {
   const tesseract = await import('tesseract.js');
   const results = [];

   for (const img of images) {
       const worker = await tesseract.createWorker('eng');
       const { data: { text } } = await worker.recognize(img);
       results.push(text);
       await worker.terminate();
   }

   return results.join('\n\n');
}
