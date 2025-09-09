import React, { useState, useEffect } from "react";
import ModalCard from "./modalCard";
import BolinhaPequena from "./bolinha";

// 🔹 Componente Avatar
function UserAvatar({ name }) {
  const initials = name
    ? name.trim().substring(0, 2).toUpperCase()
    : "??";

  return (
    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold">👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍👍
      {initials}
    </div>
  );
}

function Cards() {
  const [openModal, setOpenModal] = useState(null);
  const [search, setSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState("todos");
  const [user, setUser] = useState(null);

  // 🔹 Carregar usuário do localStorage ao montar o componente
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const cards = [
    {
      title: "Burguer King",  
      description:
        "Sabor autêntico e inconfundível, preparado no fogo e servido do seu jeito, com a rapidez que o seu dia pede.",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Burger_King_logo_%281999%E2%80%932020%29.svg/1200px-Burger_King_logo_%281999%E2%80%932020%29.svg.png",
      customText: "Aproximadamente 40 minutos de espera",
      fila: "grande",
    },
    {
      title: "McDonalds",
      description:
        "Refeições rápidas e confiáveis, com o sabor que conquista o mundo e a conveniência que se adapta ao seu dia a dia.",
      img: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
      customText: "tempo de espera estimado: 10 minutos",
      fila: "pequena",
    },
    {
      title: "KFC",
      description:
        "Frango crocante e saboroso, preparado com a receita secreta de 11 ervas e especiarias, servido com rapidez e acolhimento em qualquer lugar do mundo.",
      img: "https://upload.wikimedia.org/wikipedia/sco/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png",
      customText: "tempo de espera estimado: 20 minutos",
      fila: "média",
    },
    {
      title: "Subway",
      description:
        "Subway: ingredientes frescos, combinações infinitas e a liberdade de criar o sanduíche do seu jeito.",
      img: "https://www.pngall.com/wp-content/uploads/13/Subway-Logo-PNG-Image.png",
      customText: "tempo de espera estimado: 5 minutos",
      fila: "pequena",
    },
    {
      title: "Pizza Hut",
      description:
        "Pizzas deliciosas com cobertura generosa, massa crocante e entrega rápida para aproveitar sem esperar.",
      img: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Pizza_Hut_classic_logo.svg",
      customText: "tempo de espera estimado: 30 minutos",
      fila: "grande",
    },
    {
      title: "Domino's Pizza",
      description:
        "Pizza fresca e saborosa, entregue rapidamente com a garantia de qualidade que você conhece.",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Domino%27s_pizza_logo.svg/2036px-Domino%27s_pizza_logo.svg.png",
      customText: "tempo de espera estimado: 25 minutos",
      fila: "média",
    },
    {
      title: "Starbucks",
      description:
        "Cafés especiais, bebidas quentes e frias, preparados com perfeição para o seu momento de pausa.",
      img: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/640px-Starbucks_Corporation_Logo_2011.svg.png",
      customText: "tempo de espera estimado: 8 minutos",
      fila: "pequena",
    },
    {
      title: "Dunkin'",
      description:
        "Donuts e cafés irresistíveis, servidos rapidamente para o seu dia começar ou terminar com sabor.",
      img: "https://logos-world.net/wp-content/uploads/2020/12/Dunkin-Emblem.png",
      customText: "tempo de espera estimado: 7 minutos",
      fila: "pequena",
    },
  ];

  // 🔎 Filtrar cards
  const filteredCards = cards.filter((card) => {
    const matchSearch = card.title.toLowerCase().includes(search.toLowerCase());
    const matchQueue =
      queueFilter === "todos" ? true : card.fila === queueFilter;
    return matchSearch && matchQueue;
  });

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* 🔎 Barra de pesquisa, filtro e avatar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl shadow-md">
        {/* Input de pesquisa */}
        <div className="relative w-full sm:w-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar restaurante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
          />
        </div>

        {/* Botões de filtro */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
          {["todos", "pequena", "média", "grande"].map((f) => (
            <button
              key={f}
              onClick={() => setQueueFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition 
                ${
                  queueFilter === f
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {f === "todos"
                ? "Todas as filas"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

      </div>

      {/* Grid de cards */}
      <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
        {filteredCards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => setOpenModal(idx)}
            className="group block rounded-xl overflow-hidden focus:outline-none text-left border border-gray-200 hover:border-gray-400 transition-colors duration-300 shadow-sm hover:shadow-md"
            aria-label={`Abrir card: ${card.title}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4">
              <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-48 h-36 flex items-center justify-center bg-white">
                <img
                  src={card.img}
                  alt={card.title}
                  className="max-w-[150px] max-h-[80px] mx-auto my-0 group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out object-contain rounded-xl"
                />
              </div>
              <div className="grow">
                <h3 className="text-xl font-semibold text-black">{card.title}</h3>
                <p className="mt-3 text-black">{card.description}</p>
                <p className="mt-4 inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 group-hover:underline group-focus:underline font-medium">
                  Ver fila
                  <svg
                    className="shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </p>
              </div>
            </div>
            {openModal === idx && (
              <ModalCard
                open={true}
                onClose={() => setOpenModal(null)}
                card={card}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Cards;
