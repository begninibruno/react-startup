import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY=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,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { mensagem } = req.body;
    if (!mensagem) return res.status(400).json({ texto: "Mensagem vazia" });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: mensagem }],
    });

    const respostaIA = completion.choices[0].message.content;
    res.json({ texto: respostaIA });
  } catch (err) {
    console.error(err);
    res.status(500).json({ texto: "Erro na IA" });
  }
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
