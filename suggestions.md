// Start Ollama server
ipcMain.handle('start-ollama', async () => {
  try {
    // Check if ollama is installed
    const ollamaPath = 'ollama'; // Adjust path if needed
    ollamaProcess = spawn(ollamaPath, ['serve']);
    
    ollamaProcess.stdout.on('data', (data) => {
      console.log(`Ollama stdout: ${data}`);
    });
    
    ollamaProcess.stderr.on('data', (data) => {
      console.error(`Ollama stderr: ${data}`);
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Stream tokens from Ollama
ipcMain.handle('stream-ollama', async (event, prompt, model = 'llama3') => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        try {
          const data = JSON.parse(line);
          if (data.response) {
            event.sender.send('token-stream', data.response);
          }
          if (data.done) {
            event.sender.send('stream-complete', data);
          }
        } catch (e) {
          // Handle incomplete JSON lines
          console.error('Error parsing JSON:', e);
        }
      }
    }
  } catch (error) {
    event.sender.send('stream-error', error.message);
  }
});

// Clean up
app.on('before-quit', () => {
  if (ollamaProcess) {
    ollamaProcess.kill();
  }
});
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Ollama Streaming Demo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    #output { 
      border: 1px solid #ccc; 
      min-height: 200px; 
      padding: 10px; 
      margin: 10px 0; 
      white-space: pre-wrap;
    }
    button { padding: 10px 15px; margin: 5px; }
    input { width: 70%; padding: 8px; margin: 5px 0; }
  </style>
</head>
<body>
  <h1>Ollama Token Streaming</h1>
  
  <input type="text" id="prompt" placeholder="Enter your prompt here...">
  <button onclick="startStream()">Start Stream</button>
  <button onclick="stopStream()">Stop Stream</button>
  
  <div id="output"></div>
  
  <script>
    const { ipcRenderer } = require('electron');
    let isStreaming = false;
    
    function startStream() {
      const prompt = document.getElementById('prompt').value;
      if (!prompt) return;
      
      document.getElementById('output').textContent = '';
      isStreaming = true;
      
      ipcRenderer.invoke('stream-ollama', prompt)
        .catch(error => {
          console.error('Stream error:', error);
          document.getElementById('output').textContent = 'Error: ' + error.message;
        });
    }
    
    function stopStream() {
      isStreaming = false;
      document.getElementById('output').textContent = 'Stream stopped';
    }
    
    // Listen for streaming events
    ipcRenderer.on('token-stream', (event, token) => {
      if (isStreaming) {
        document.getElementById('output').textContent += token;
      }
    });
    
    ipcRenderer.on('stream-complete', (event, data) => {
      isStreaming = false;
      console.log('Stream complete:', data);
    });
    
    ipcRenderer.on('stream-error', (event, error) => {
      isStreaming = false;
      document.getElementById('output').textContent += '\nError: ' + error;
    });
    
    // Start Ollama server on app load
    ipcRenderer.invoke('start-ollama').then(result => {
      if (result.success) {
        console.log('Ollama started successfully');
      } else {
        console.error('Failed to start Ollama:', result.error);
      }
    });
  </script>
</body>
</html>

Key features of this implementation.
Main Process Setup:

Starts Ollama server using child_process.spawn
Handles streaming through fetch with ReadableStream
Parses JSON chunks from the streaming response
Sends tokens back to renderer via IPC
Renderer Process:

Handles user input and streaming controls
Receives tokens via IPC events
Displays streaming output in real-time
Handles errors and completion states
Streaming Logic:

Uses fetch with streaming enabled
Processes JSON chunks line-by-line
Sends tokens as they arrive to the UI
Handles completion and error states
Error Handling:

Network errors
JSON parsing errors
Ollama server startup failures
Clean shutdown of processes
To use this:

Install Ollama on your system
Run npm install electron
Save the files as main.js and index.html in your project
Run with npx electron .
The streaming will show tokens as they arrive from Ollama, with real-time display in the UI. You can customize the model name and prompt in the HTML input field.
