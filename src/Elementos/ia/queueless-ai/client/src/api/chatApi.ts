import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/chat';

export const sendMessage = async (message, history) => {
  try {
    const response = await axios.post(API_URL, {
      prompt: message,
      history: history,
    });
    return response.data.reply;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message to the AI.');
  }
};