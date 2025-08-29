import axios from 'axios';

const API_URL = 'http://localhost:5000/chat';

export const sendMessageToAI = async (message) => {
  try {
    const response = await axios.post(API_URL, { message });
    return response.data.reply;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw new Error('Could not connect to the AI service.');
  }
};