import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Instancia do cliente OpenAI com a chave do .env
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rota do chat

// Cadastro de usuários (em memória)
const usuarios = [];

app.post("/usuarios", (req, res) => {
  const { name, email, key } = req.body;
  if (!name || !email || !key) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  // Verifica se já existe usuário com o mesmo email
  if (usuarios.find(u => u.email === email)) {
    return res.status(409).json({ error: "E-mail já cadastrado." });
  }
  usuarios.push({ name, email, key });
  return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
});

// Rota do chat
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body; // ⚠️ atenção: deve ser 'message'

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Responda sempre de forma simples e curta." },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).send("Erro ao conectar com o suporte.");
  }
});

// Porta do servidor
const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
