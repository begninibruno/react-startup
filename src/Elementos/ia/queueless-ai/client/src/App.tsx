import React from 'react';
import ChatWindow from './components/ChatWindow';
import './styles/index.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>Welcome to QueueLess AI</h1>
      <ChatWindow />
    </div>
  );
};

export default App;