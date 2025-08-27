import React from 'react';

function BolinhaVerde() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span className="text-black text-sm"> Fila Pequena</span>
    </div>
  );
}

export default BolinhaVerde;