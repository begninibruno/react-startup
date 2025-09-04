"use client"
import { useState } from 'react';
import {
  Webchat,
  WebchatProvider,
  Fab,
  getClient,
} from '@botpress/webchat';

const clientId = "b49e558b-6bde-4b25-961a-9174199d22f5";

function Chat() {
  const client = getClient({ clientId });
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  const toggleWebchat = () => {
    setIsWebchatOpen((prev) => !prev);
  };

  const configuration = {
    composerPlaceholder: "Digite sua mensagem...",
    botName: "QueueLess Bot",
    email: "suporte@queueless.com",
    theme: "dark",
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WebchatProvider client={client} configuration={configuration}>
        <Fab onClick={toggleWebchat} />
        <div style={{ display: isWebchatOpen ? 'block' : 'none' }}>
          <Webchat />
        </div>
      </WebchatProvider>
    </div>
  );
}

export default Chat;
