// servidor Node/Express simples que faz proxy ao OpenAI
// npm i express node-fetch dotenv
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn('WARNING: OPENAI_API_KEY não configurada. Configure no .env');
}

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt obrigatório' });

    // construir mensagens (ajuste conforme necessidade)
    const messages = [
      { role: 'system', content: 'Você é um assistente conciso em português que entende gírias e contexto.' },
      // opcional: incluir histórico do cliente para contexto
      ...(Array.isArray(history) ? [] : []),
      { role: 'user', content: prompt },
    ];

    const body = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.6,
      max_tokens: 600,
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(resp.status).send(txt);
    }
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || '';
    res.json({ reply });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'erro interno' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API rodando na porta ${port}`));