import { useState, useEffect } from 'react';
import { sendMessageToAI } from '../api/chatApi';

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { text: userMessage, isAI: false }]);
    setLoading(true);

    try {
      const response = await sendMessageToAI(userMessage);
      setMessages((prev) => [...prev, { text: response, isAI: true }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { text: 'Error: Unable to get response.', isAI: true }]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
};

export default useChat;