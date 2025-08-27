import React from 'react'
import Navbar from './Elementos/navbar.jsx'
import Background from './Elementos/background.jsx'
import Login from './Elementos/login.jsx';
import { BrowserRouter } from 'react-router-dom';
import Registro from './Elementos/registro.jsx';
import Landpage from './Elementos/landpage.jsx';
import Cards from './Elementos/cards.jsx';




const App = () => {
  return (
    <div>
      <Login/>
      <Navbar/>
      <Background/>
      <Registro/>
      <Landpage/>
      <Cards/>
      
     
      
      
    </div>
  )
}



export default App;