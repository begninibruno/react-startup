import React from "react"
import { useUser } from "../Navbar" // importa do Navbar, pq o context tá junto nele

function LoginPage() {  
  const [email, setEmail] = useState("");

  // Estado para armazenar a senha digitada pelo usuário
  const [senha, setSenha] = useState("");

  // Estado para controlar o loading durante o processo de login
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault()

    

    // Pega os valores de email e senha do formulário
    const email = e.target.email.value
    const password = e.target.password.value

    try {
      // Chamada real da API
      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer login")
      }

      const data = await response.json()
      console.log("Usuário logado:", data)

      // Salva no contexto → Navbar mostra iniciais
      setUser({ name: data.name })
    } catch (error) {
      console.error(error)
      alert("Falha no login. Verifique suas credenciais.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 mt-20"
    >
      <h1 className="text-xl font-bold text-white">Login</h1>

      {/* Inputs de email e senha */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="px-4 py-2 rounded-md"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Senha"
        className="px-4 py-2 rounded-md"
        required
      />

      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-700"
      >
        Fazer Login
      </button>
    </form>
  )
}

export default LoginPage
