import React from 'react'
import Navbar from './Elementos/navbar.jsx'
import Background from './Elementos/background.jsx'
import Login from './Elementos/login.jsx';
import { BrowserRouter } from 'react-router-dom';
import Registro from './Elementos/registro.jsx';


const App = () => {
  return (
    <div>
      <Login/>
      <Navbar/>
      <Background/>
     <Registro/>
      
      
    </div>
  )
}



export default App;