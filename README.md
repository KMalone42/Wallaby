This Electron application includes:

 1 A chat interface with:
    • Clean, modern UI with gradient backgrounds
    • Message bubbles for user and AI
    • Timestamps on messages
    • Responsive design
    • Smooth animations
 2 A settings page with:
    • Theme selection (light, dark, auto)
    • Language options
    • AI model selection
    • Creativity level slider
    • Privacy settings
    • Advanced configuration options
    • Save and reset functionality
 3 Core functionality:
    • Real-time chat simulation
    • Message sending with Enter key or button
    • Auto-scrolling to new messages
    • Responsive design that works on different screen sizes

The app uses a modern color scheme with gradients and subtle shadows for depth. The settings page has a clean, organized layout with
grouped options and intuitive controls. The chat interface simulates AI responses with a slight delay to mimic real API calls.

To run this application:

 1 Create a new Electron project
 2 Place these files in the project directory
 3 Run npm install to install dependencies
 4 Run npm start to launch the app

The settings page is fully functional and can be accessed through the menu. The chat interface simulates AI responses but can be easily
connected to a real AI API by modifying the getAIResponse function in renderer.js.


