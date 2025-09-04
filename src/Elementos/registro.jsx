import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ou use fetch se preferir
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '../Services/api.js';




function Registro() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([])

  const inputName = useRef()                  
  const inputEmail = useRef()
  const inputKey = useRef()

  async function createUsers(){
      await api.post('/usuarios',{
        name: inputName.current.value,
        email: inputEmail.current.value,
        pass: inputKey.current.value    
      })
  }

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    try {
     const response = await axios.post('http://localhost:3000/usuarios', {
        name: form.name,
        email: form.email,
        key: form.password
      });

      if (response.status === 201) {
        navigate('/'); // redireciona para login após cadastro
      }
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.error || 'Erro ao cadastrar usuário.');
    }
  };

  return (

    
    <div className="flex min-h-screen flex-col justify-start px-6 py-4 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-10">
        <img
          alt="QueueLess"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-black">
          Crie sua conta
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm/6 font-medium text-black-100">
              Nome completo
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="block w-full rounded-md bg-[#eef0ff] border border-[#6366f1] px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm/6"
              />
            </div>
          </div>

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
                className="block w-full rounded-md bg-[#eef0ff] border border-[#6366f1] px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-black-100">
              Senha
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="block w-full rounded-md bg-[#eef0ff] border border-[#6366f1] px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-black-100">
              Confirme sua senha
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="block w-full rounded-md bg-[#eef0ff] border border-[#6366f1] px-3 py-1.5 text-base text-black placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            > 
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registro;
