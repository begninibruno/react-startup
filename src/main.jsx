import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navbar from './Elementos/navbar.jsx';
import Login from './Elementos/login.jsx';
import Background from './Elementos/background.jsx';
import Cadastro from './Elementos/registro.jsx';
import Registro from './Elementos/registro.jsx';
import Landpage from './Elementos/landpage.jsx';
import Plancard from './Elementos/plancard.jsx';
  


// ✅ Importar o UserProvider
import { UserProvider } from './Elementos/Contexts/Context.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Background />,
  },
  {
    path: '/navbar',
    element: <Navbar />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },
  {
    path: '/landpage',
    element: <Landpage />,
  },
  {
    path: '/plancard',
    element: <Plancard />,
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ✅ Envolvendo todo o app com UserProvider */}
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>,
);
