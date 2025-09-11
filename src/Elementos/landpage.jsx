import { useNavigate } from "react-router-dom";
import Background from "./background"
import Cards from "./cards"
import { useUser } from "./Contexts/Context";
import Navbar from "./navbar"
import { useEffect } from "react";
//import UserContext from "./Contexts/Context"
//import { useContext } from "react"


function Landpage () {
  const { user, setUser } = useUser(); // ✅ Usando o context
  const navigate = useNavigate();
  useEffect(() => {
     // codigo aqui
     if (!user) {
       // redirecionar para login
       navigate('/login');
     }
     
}, [])

 
    return (
    <div className="landpage">
 
        <Navbar/> 
        <Cards/>
      
       
      


        <style>
          

    {`      /* Chrome, Edge, Safari */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: #f3f4f6; /* fundo claro */
      }

      ::-webkit-scrollbar-thumb {
        background-color: #22c55e; /* verde KiwiLess */
        border-radius: 9999px;
        min-height: 40px;
        border: 2px solid #f3f4f6;
      }

      ::-webkit-scrollbar-thumb:hover {
        background-color: #16a34a; /* verde mais escuro ao hover */
      }

      ::-webkit-scrollbar-button,
      ::-webkit-scrollbar-button:start:decrement,
      ::-webkit-scrollbar-button:end:increment {
        display: none;
        width: 0;
        height: 0;
        background: transparent;
        -webkit-appearance: none !important;
        appearance: none !important;
      }

      ::-webkit-scrollbar-corner {
        background: transparent !important;
      }

      /* Firefox */
      * {
        scrollbar-width: thin;
        scrollbar-color: #22c55e #f3f4f6;
      }
    `}
    </style>
    </div>  
    
  )
}    

export default Landpage