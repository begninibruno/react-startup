import React from "react";


function Cards() {
  const cards = [
    {
      title: "Burguer King",
      description:
        "Produce professional, reliable streams easily leveraging Preline's innovative broadcast studio",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Burger_King_logo_%281999%E2%80%932020%29.svg/1200px-Burger_King_logo_%281999%E2%80%932020%29.svg.png",
      href: "#",
    },
    {
      title: "McDonalds",
      description:
        "Optimize your in-person experience with best-in-class capabilities like badge printing and lead retrieval",
        
      img: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
      href: "#",
      
    },
    {
      title: "KFC",
      description:
        "How to make objectives and key results work for your company",
      img: "https://upload.wikimedia.org/wikipedia/sco/thumb/b/bf/KFC_logo.svg/1200px-KFC_logo.svg.png",
      href: "#",
    },
    {
      title: "Subway",
      description: "Six approaches to bringing your People strategy to life",
      img: "https://www.pngall.com/wp-content/uploads/13/Subway-Logo-PNG-Image.png  ",
      href: "#",
    },
  ];

  return (
    <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      {/* Grid */}
      <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
        {cards.map((card, idx) => (
          <a
            key={idx}
            href={card.href}
            className="group block rounded-xl overflow-hidden focus:outline-none"
            aria-label={`Read article: ${card.title}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
                <img
                  src={card.img}
                  alt={card.title}
                  className="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl"
                />
              </div>

              <div className="grow">
                <h3 className="text-xl font-semibold text-black">
                  {card.title}
                </h3>
                <p className="mt-3 text-black">
                  {card.description}
                </p>
                <p className="mt-4 inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 group-hover:underline group-focus:underline font-medium">
                  Read more
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
          </a>
        ))}
      </div>
    </div>
  );
}

export default Cards;
