import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// rota de teste GET para evitar "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Servidor backend OK. Use POST /api/chat");
});

app.post("/api/chat", async (req, res) => {
  console.log("POST /api/chat recebido. body:", req.body);
  const { pergunta } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!pergunta || typeof pergunta !== "string") {
    return res.status(400).json({ error: "Campo 'pergunta' obrigatório." });
  }
  if (!apiKey) {
    console.error("OPENAI_API_KEY não encontrado em process.env");
    return res.status(500).json({ error: "Chave de API não configurada no servidor." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Você é um assistente útil e objetivo para dúvidas sobre a plataforma QueueLess." },
          { role: "user", content: pergunta }
        ],
        max_tokens: 500,
        temperature: 0.6,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro OpenAI:", data);
      return res.status(502).json({ error: "Erro na API da OpenAI", detail: data });
    }

    const texto = data.choices?.[0]?.message?.content?.trim() || "Desculpe, não entendi.";
    res.json({ resposta: texto });
  } catch (err) {
    console.error("Erro ao chamar OpenAI:", err);
    res.status(500).json({ error: "Erro interno ao conectar com o suporte.", detail: String(err) });
  }
});


// Armazenamento em memória de usuários
const usuarios = [];

// Cadastro de usuário
app.post("/usuarios", (req, res) => {
  const { name, email, key } = req.body;
  if (!name || !email || !key) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  if (usuarios.find(u => u.email === email)) {
    return res.status(409).json({ error: "E-mail já cadastrado." });
  }
  usuarios.push({ name, email, key });
  return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
});

// Login de usuário
app.post("/login", (req, res) => {
  const { email, key } = req.body;
  if (!email || !key) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }
  const user = usuarios.find(u => u.email === email && u.key === key);
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  }
  return res.status(200).json({ message: "Login realizado com sucesso!", name: user.name });
});

// Porta do servidor (escuta em 0.0.0.0 para acesso pela rede)
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => console.log(`Servidor rodando em http://0.0.0.0:${PORT}`));
