# QueueLess AI

QueueLess AI is an intelligent chat application designed to provide users with real-time assistance and information without relying on predefined responses. The application leverages advanced AI capabilities to understand user queries and generate relevant responses dynamically.

## Project Structure

The project is divided into two main parts: the client and the server.

### Client

The client-side application is built using React and TypeScript. It includes the following key files:

- **package.json**: Configuration file for managing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file specifying compiler options.
- **public/index.html**: Main HTML file serving as the entry point for the React app.
- **src/index.tsx**: Entry point for the React application, rendering the main App component.
- **src/App.tsx**: Defines the main App component.
- **src/components/ChatWindow.tsx**: Displays the chat interface and handles user interactions.
- **src/hooks/useChat.ts**: Custom hook for managing chat state and sending messages to the AI.
- **src/api/chatApi.ts**: Functions for making API calls to the server for chat interactions.
- **src/styles/index.css**: CSS styles for the client application.

### Server

The server-side application is built using Node.js and TypeScript. It includes the following key files:

- **package.json**: Configuration file for managing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file specifying compiler options.
- **src/index.ts**: Entry point for the server application, setting up the Express server and middleware.
- **src/routes/chat.ts**: Exports chat routes for handling chat-related API requests.
- **src/controllers/chatController.ts**: Contains methods for processing chat messages and interacting with the AI.
- **src/services/aiClient.ts**: Functions for communicating with the AI service, handling the logic for generating intelligent responses.

## Getting Started

To get started with the QueueLess AI project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd queueless-ai
   ```

3. Install dependencies for both client and server:
   ```
   cd client
   npm install
   cd ../server
   npm install
   ```

4. Set up environment variables:
   - Copy the `.env.example` file to `.env` and configure the necessary variables.

5. Start the development servers:
   - For the client:
     ```
     cd client
     npm start
     ```
   - For the server:
     ```
     cd server
     npm start
     ```

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.