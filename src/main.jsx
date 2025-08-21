import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'  
import Navbar from './Elementos/navbar.jsx'
import Login from './Elementos/login.jsx'
import Background from './Elementos/background.jsx'
import Cadastro from './Elementos/registro.jsx'

const router = createBrowserRouter([
  {
      path: '/',
      element: <Login />, 
  },

  {

    path: '/navbar',
    element: <Navbar />,
  },

  {
    path: '/background',
    element: <Background />
  },

  



]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
