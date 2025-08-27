import { Bars3Icon, XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'A QueueLess', href: '#a-queueless' },
  { name: 'Como Funciona', href: '#como-funciona' },
  { name: 'Suporte', href: '#suporte' },
];

function Background() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [mensagensChat, setMensagensChat] = useState([
    { texto: "Olá 👋 Como posso te ajudar hoje?", isIA: true }
  ]);

  const navigate = useNavigate();
  const handleEntrar = () => navigate('/login');

  // Envia mensagem para backend IA
  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    setMensagensChat([...mensagensChat, { texto: mensagem, isIA: false }]);
    setMensagem('');

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem })
      });
      const data = await res.json();
      setMensagensChat(prev => [...prev, { texto: data.texto, isIA: true }]);
    } catch (err) {
      setMensagensChat(prev => [...prev, { texto: "Erro ao conectar com o suporte.", isIA: true }]);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* HEADER */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">QueueLess</span>
              <img
                alt="QueueLess"
                src="logoteste2.png"
                width={90}
                className="mx-auto h-20 w-auto"
              />
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
            >
              <span className="sr-only">Abrir menu principal</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white hover:text-indigo-400">
                {item.name}
              </a>
            ))}
          </div>
          <button className="hidden lg:flex lg:flex-1 lg:justify-end" onClick={handleEntrar}>
            <span className="text-sm/6 font-semibold text-white">
              Entrar <span aria-hidden="true">&rarr;</span>
            </span>
          </button>
        </nav>

        {/* Mobile menu panel */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <img alt="QueueLess" src="logoteste2.png" className="h-10 w-auto" />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-200"
              >
                <span className="sr-only">Fechar menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <button
                    onClick={handleEntrar}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      {/* HERO */}
      <section className="relative isolate px-6 pt-32 lg:px-8" id="home">
        <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-32 text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
            Cansado de perder tempo em filas?
          </h1>
          <p className="mt-8 text-lg font-medium text-gray-400 sm:text-xl/8">
            Com a <span className="text-[#6875F5] font-bold text-xl">QueueLess</span>, você acompanha em tempo real a fila da loja que deseja visitar — direto do seu celular.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              type="button"
              onClick={handleEntrar}
              className="rounded-md bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400"
            >
              Entrar
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO A QueueLess */}
      <section id="a-queueless" className="px-6 py-20 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-balance sm:text-1xl">A QueueLess</h2>
          <p className="mt-6 text-lg text-gray-300">
            A <span className="text-[#6875F5] font-bold text-xl">QueueLess</span> é uma aplicação que mostra em tempo real como está o movimento do estabelecimento que você deseja visitar.
            Você pode verificar se está lotado, se a fila está curta ou se é o momento ideal para ir.
          </p>
        </div>
      </section>

      {/* SEÇÃO Como Funciona */}
      <section id="como-funciona" className="px-6 py-20 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-balance sm:text-1xl">Como Funciona?</h2>
          <p className="mt-6 text-lg text-gray-300">
            O funcionamento é simples: o estabelecimento envia informações sobre o fluxo de clientes,
            e a <span className="text-[#6875F5] font-bold text-xl">QueueLess</span> organiza esses dados de forma visual, permitindo que você veja rapidamente se a fila está grande ou tranquila.
          </p>
        </div>
      </section>

      {/* SEÇÃO Suporte */}
      <section id="suporte" className="px-6 py-20 lg:px-8 border-t border-white/10 bg-gray-900 relative">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-[#6875F5]">Suporte</h2>
          <p className="mt-6 text-lg text-gray-300">
            Tem dúvidas ou precisa de ajuda? Nossa equipe de suporte está disponível para garantir
            que você aproveite ao máximo a experiência com a <span className="text-[#6875F5] font-bold">QueueLess</span>.  
            Entre em contato pelo nosso chat ou pelas nossas redes sociais abaixo.
          </p>

          {/* Redes Sociais */}
          <div className="mt-10 flex justify-center gap-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/facebook-white.svg" alt="Facebook" className="w-8 h-8" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/instagram-white.svg" alt="Instagram" className="w-8 h-8" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/twitter-white.svg" alt="Twitter" className="w-8 h-8" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
              <img src="/icons/linkedin-white.svg" alt="LinkedIn" className="w-8 h-8" />
            </a>
          </div>
        </div>

        {/* Botão de Chat Flutuante */}
      <button
        className="fixed bottom-6 right-6 bg-[#6875F5] p-4 rounded-full shadow-lg hover:bg-indigo-500 transition"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
      </button>

      {/* Janela do Chat */}
      <Transition show={chatOpen} as={Fragment}>
        <div className="fixed bottom-20 right-6 w-80 bg-gray-800 rounded-2xl shadow-lg p-4 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-2">Fale conosco</h3>
          <div className="flex-1 overflow-y-auto mb-2 space-y-2 max-h-60">
            {mensagensChat.map((msg, i) => (
              <div key={i} className={`flex ${msg.isIA ? "justify-start" : "justify-end"}`}>
                <div className={`${msg.isIA ? "bg-[#6875F5]" : "bg-gray-600"} text-white px-3 py-2 rounded-lg text-sm max-w-xs`}>
                  {msg.texto}
                </div>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-l-lg bg-gray-700 text-white px-3 py-2 focus:outline-none"
            />
            <button
              onClick={enviarMensagem}
              className="bg-[#6875F5] px-4 py-2 rounded-r-lg hover:bg-indigo-500 text-white font-semibold"
            >
              Enviar
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default Background;