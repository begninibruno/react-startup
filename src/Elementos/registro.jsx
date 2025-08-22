import { useNavigate } from 'react-router-dom';

function Registro() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de autenticação
  navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col justify-start px-6 py-4 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-10">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-black">Crie sua conta</h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
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