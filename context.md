Ollama API (Current): https://github.com/ollama/ollama/blob/main/docs/api.md

Based on the provided Ollama API documentation, here's how a JavaScript application can interact with it:                                                                                 

 1 Make HTTP Requests: JavaScript applications can use standard HTTP client libraries or the built-in fetch API (in browsers) or axios/node-fetch (in Node.js) to send requests to the Ollama API endpoints.
 2 Endpoint Usage:                                                                                                                                                                        
    • Generate Completion (`/api/generate`): Send a POST request with a JSON body containing model, prompt, and optionally stream, format, options, etc. For streaming responses, the client needs to handle the
      stream of JSON objects. For non-streaming, it receives a single JSON object.                                                                                                        
    • Chat Completion (`/api/chat`): Send a POST request with a JSON body containing model, messages, and optionally stream, format, tools, options, etc. Similar to generate, handle streaming or non-streaming
      responses.                                                                                                                                                                          
    • Other Endpoints: Use corresponding HTTP methods (GET, POST, DELETE) and JSON payloads for endpoints like `/api/tags`, `/api/show`, `/api/pull`, `/api/push`, `/api/embed`, etc.
 3 Handling Responses:
    • Streaming: If stream is true, the API returns a stream of JSON objects. The JavaScript application must parse these objects as they arrive.                                         
    • Non-streaming: The API returns a single JSON object containing the result.                                                                                                          
 4 Example (Node.js with fetch):

```JavaScript
   // Example: Generate a completion                                                                                                                                                      
   const response = await fetch('http://localhost:11434/api/generate', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({                                                                                                                                                               
       model: 'llama3.2',                                                                                                                                                                 
       prompt: 'Why is the sky blue?',                                                                                                                                                    
       stream: false // Set to true for streaming                                                                                                                                         
     }),                                                                                                                                                                                  
   });                                                                                                                                                                                    
                                                                                                                                                                                          
   if (!response.ok) {                                                                                                                                                                    
     throw new Error(`HTTP error! status: ${response.status}`);                                                                                                                           
   }                                                                                                                                                                                      
                                                                                                                                                                                          
   const data = await response.json();                                                                                                                                                    
   console.log(data.response); // The generated text                                                                                                                                      
```

 5 Error Handling: Always check the HTTP status codes and handle potential errors from the API.                                                                                           
 6 Authentication: The API itself doesn't require authentication for basic operations, but some features might require it in specific setups.                                             

This approach allows JavaScript applications to integrate with Ollama's API for tasks like generating text, managing models, and creating embeddings. 

