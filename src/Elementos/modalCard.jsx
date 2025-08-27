
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';
import BolinhaPequena from './bolinha';
import BolinhaVerde from './bolinhaverde';
import BolinhaLaranja from './bolinhalaranja';


function ModalCard({ open, onClose, card }) {
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <DialogPanel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          {card && (
            <>
              <img src={card.img} alt={card.title} className="w-full h-40 object-contain mb-4 rounded" />
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                {card.title}
                {card.title === "Burguer King" && <BolinhaPequena />}
                {card.title === "KFC" && <BolinhaLaranja />}
                {card.title === "Subway" && <BolinhaVerde />}
                {card.title === "McDonalds" && <BolinhaVerde />}
                {card.title === "Pizza Hut" && <BolinhaPequena/>}
                {card.title === "Domino's Pizza" && <BolinhaLaranja/>}
                {card.title === "Starbucks" && <BolinhaVerde/>}
                {card.title === "Dunkin'" && <BolinhaVerde/>}
                

                
            
                
                  
                
              </h2>
              {card.customText.split('\n').map((line, i) => (
  <p className="mb-2" key={i}>{line}</p>
))}
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default ModalCard;
