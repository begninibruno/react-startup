import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000/api/ai';

export const getAIResponse = async (userInput) => {
  try {
    const response = await axios.post(AI_SERVICE_URL, { input: userInput });
    return response.data.reply;
  } catch (error) {
    console.error('Error communicating with AI service:', error);
    throw new Error('Failed to get response from AI service');
  }
};