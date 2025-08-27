import React, { useState } from "react";
import BolinhaPequena from "./bolinha";
import ModalCard from "./modalCard";

function Cards() {
  const [openModal, setOpenModal] = useState(null);
  const cards = [
    {
      title: "Burguer King",
      description:
        "Sabor autêntico e inconfundível, preparado no fogo e servido do seu jeito, com a rapidez que o seu dia pede.",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Burger_King_logo_%281999%E2%80%932020%29.svg/1200px-Burger_King_logo_%281999%E2%80%932020%29.svg.png",
      href: "#",
      customText: "Aproximadamente 40 minutos de espera",
    },
    {
      title: "McDonalds",
      description:
        "Refeições rápidas e confiáveis, com o sabor que conquista o mundo e a conveniência que se adapta ao seu dia a dia.",
      img: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
      href: "#",
      customText: "tempo de espera estimado: 10 minutos",
    },
    {
      title: "KFC",
      description:
        "Frango crocante e saboroso, preparado com a receita secreta de 11 ervas e especiarias, servido com rapidez e acolhimento em qualquer lugar do mundo.",
      img: "https://upload.wikimedia.org/wikipedia/sco/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png",
      href: "#",
      customText: "tempo de espera estimado: 20 minutos",
    },
    {
      title: "Subway",
      description:
        "Subway: ingredientes frescos, combinações infinitas e a liberdade de criar o sanduíche do seu jeito.",
      img: "https://www.pngall.com/wp-content/uploads/13/Subway-Logo-PNG-Image.png",
      href: "#",
      customText: "tempo de espera estimado: 5 minutos",
    },
    {
      title: "Pizza Hut",
      description:
        "Pizzas deliciosas com cobertura generosa, massa crocante e entrega rápida para aproveitar sem esperar.",
      img: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Pizza_Hut_classic_logo.svg",
      href: "#",
      customText: "tempo de espera estimado: 30 minutos",
    },
    {
      title: "Domino's Pizza",
      description:
        "Pizza fresca e saborosa, entregue rapidamente com a garantia de qualidade que você conhece.",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Domino%27s_pizza_logo.svg/2036px-Domino%27s_pizza_logo.svg.png",
      href: "#",
      customText: "tempo de espera estimado: 25 minutos",
    },
    {
      title: "Starbucks",
      description:
        "Cafés especiais, bebidas quentes e frias, preparados com perfeição para o seu momento de pausa.",
      img: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/640px-Starbucks_Corporation_Logo_2011.svg.png",
      href: "#",
      customText: "tempo de espera estimado: 8 minutos",
    },
    {
      title: "Dunkin'",
      description:
        "Donuts e cafés irresistíveis, servidos rapidamente para o seu dia começar ou terminar com sabor.",
      img: "https://logos-world.net/wp-content/uploads/2020/12/Dunkin-Emblem.png",
      href: "#",
      customText: "tempo de espera estimado: 7 minutos",
    },
  ];

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
        {cards.map((card, idx) => (
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
              <ModalCard open={true} onClose={() => setOpenModal(null)} card={card} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Cards;
