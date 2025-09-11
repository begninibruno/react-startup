import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { useUser } from "./Contexts/Context"
  
function Login() {

  const { setUser } = useUser(); // Hook para acessar o contexto do usuário
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // limpar erros anteriores

    try {
      const response = await axios.post('https://api-users-tb6b.onrender.com/login', {
        email: form.email,
        key: form.password, // lembre que no backend você usa 'key'
      });

      // Salvar token no localStorage ou sessionStorage
      localStorage.setItem('token', response.data.token);
      
      const usuario = { userId: response.data.id, name: response.data.name, email: response.data.email };
      setUser(usuario); // Salvar usuário no contexto

      // Redirecionar para página protegida
      navigate('/landpage'); 
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao conectar com o servidor');
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-start px-6 py-4 lg:px-8 bg-gradient-to-b from-[#E9F9E1] to-[#77cd52]">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-10">
        <img alt="Your Company" src="kiwilesslogo.png" className="mx-auto h-40 w-auto" />
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-black">
          Conecte-se com sua conta
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-black-100">
              Endereço de e-mail
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="block w-full rounded-md bg-[#eef0ff] border border-[#9e771b] px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-black-100">
                Senha
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="block w-full rounded-md bg-[#eef0ff] border border-[#9e771b] px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#9e771b] px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-[#b48f3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm/6 text-slate-900">
          Ainda não é um membro?{' '}
          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="font-semibold text-[#9e771b] hover:text-yellow underline bg-transparent border-none cursor-pointer p-0"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
