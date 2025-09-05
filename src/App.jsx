import React from 'react'
import Navbar from './Elementos/navbar.jsx'
import Background from './Elementos/background.jsx'
import Login from './Elementos/login.jsx';
import { BrowserRouter } from 'react-router-dom';
import Registro from './Elementos/registro.jsx';
import Landpage from './Elementos/landpage.jsx';
import Cards from './Elementos/cards.jsx';
//import LoginPage from './Elementos/loginpages.jsx';
// Componente para escolher qual página mostrar
function MainContent() {
  const { user } = require("./Navbar").useUser(); // pega o usuário do contexto

  // Se não estiver logado, mostra login
  if (!user) return <LoginPage />;

  // Se estiver logado, mostra landing page
  return <LandingPage />;
}

//faz essa merda direito

const App = () => {
  return (
    <div>
      <BrowserRouter>      
      <Login/>
      <Navbar/>
      <Background/>
      <Registro/>
      <Landpage/>
      <Cards/>
      </BrowserRouter>
        <MainContent />

      
     
      
      
    </div>
    
  )
}



export default App; 