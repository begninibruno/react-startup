import { Request, Response } from 'express';
import { getAIResponse } from '../services/aiClient';

class ChatController {
  async handleChat(req: Request, res: Response) {
    const userMessage = req.body.message;

    try {
      const aiResponse = await getAIResponse(userMessage);
      res.json({ response: aiResponse });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ChatController();