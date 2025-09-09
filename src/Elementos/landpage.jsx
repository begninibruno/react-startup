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
      

        
        </div>
  )
}    

export default Landpage