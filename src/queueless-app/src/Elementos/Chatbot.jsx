import React, { useState } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import { enviarMensagemAI } from '../api/chatbot';

function Chatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [mensagensChat, setMensagensChat] = useState([
    { texto: "Olá! Como posso ajudar você hoje?", isIA: true },
  ]);

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    setMensagensChat([...mensagensChat, { texto: mensagem, isIA: false }]);
    const mensagemAtual = mensagem;
    setMensagem('');

    try {
      const respostaAI = await enviarMensagemAI(mensagemAtual);
      setMensagensChat(prev => [...prev, { texto: respostaAI, isIA: true }]);
    } catch (err) {
      setMensagensChat(prev => [...prev, { texto: "Desculpe, não consegui entender sua pergunta.", isIA: true }]);
    }
  };

  return (
    <div>
      <button
        className="fixed bottom-6 right-6 bg-[#6875F5] p-4 rounded-full shadow-lg hover:bg-indigo-500 transition"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
      </button>

      <Transition show={chatOpen} as={React.Fragment}>
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

export default Chatbot;