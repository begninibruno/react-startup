# 🛣️ Entendendo React Router

## O que é React Router?

React Router é a biblioteca padrão para roteamento em aplicações React. Ela permite criar aplicações SPA (Single Page Applications) com múltiplas "páginas" sem recarregamento completo.

## Conceitos Fundamentais

### **SPA vs MPA**

**Multi-Page Application (Tradicional):**

- Cada rota = novo HTML do servidor
- Página recarrega completamente
- Mais lento, mas SEO mais simples

**Single-Page Application (React):**

- Uma única página HTML
- JavaScript gerencia as "páginas"
- Mais rápido, experiência fluida

## Configuração no Projeto

### 1. **Estrutura Básica** (`main.tsx`)

```typescript
import { BrowserRouter, Route, Routes } from "react-router";

function App() {
  return (
    <BrowserRouter>
      {" "}
      {/* Habilita roteamento */}
      <Routes>
        {" "}
        {/* Container das rotas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/protected" element={<ProtectedPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. **Tipos de Router**

```typescript
// BrowserRouter - URLs limpas (recomendado)
// URL: https://meusite.com/protected
<BrowserRouter>
  <Routes>...</Routes>
</BrowserRouter>

// HashRouter - Compatibilidade com servidores estáticos
// URL: https://meusite.com/#/protected
<HashRouter>
  <Routes>...</Routes>
</HashRouter>
```

## Navegação

### 1. **Hook useNavigate** (Programática)

```typescript
import { useNavigate } from "react-router";

function MyComponent() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navegar para outra página
    navigate("/protected");

    // Navegar e substituir no histórico
    navigate("/protected", { replace: true });

    // Voltar uma página
    navigate(-1);

    // Avançar uma página
    navigate(1);
  };
}
```

### 2. **Componente Link** (Declarativa)

```typescript
import { Link } from "react-router";

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/protected">Área Protegida</Link>

      {/* Link com estado adicional */}
      <Link to="/protected" state={{ from: "navigation" }}>
        Protegida
      </Link>
    </nav>
  );
}
```

## Rotas Avançadas

### 1. **Parâmetros de Rota**

```typescript
// Definindo rotas com parâmetros
<Routes>
  <Route path="/user/:id" element={<UserProfile />} />
  <Route path="/post/:id/edit" element={<EditPost />} />
</Routes>;

// Acessando parâmetros no componente
import { useParams } from "react-router";

function UserProfile() {
  const { id } = useParams(); // { id: "123" }

  return <div>Perfil do usuário: {id}</div>;
}
```

### 2. **Query Parameters**

```typescript
import { useSearchParams } from "react-router";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL: /search?q=react&category=tutorial
  const query = searchParams.get("q"); // "react"
  const category = searchParams.get("category"); // "tutorial"

  const updateSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery, category });
  };
}
```

### 3. **Rotas Aninhadas**

```typescript
<Routes>
  <Route path="/dashboard" element={<Dashboard />}>
    <Route path="profile" element={<Profile />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>;

// No componente Dashboard
import { Outlet } from "react-router";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link to="profile">Perfil</Link>
        <Link to="settings">Configurações</Link>
      </nav>

      {/* Aqui será renderizado o componente filho */}
      <Outlet />
    </div>
  );
}
```

## Proteção de Rotas

### 1. **Componente Route Guard**

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
}

function ProtectedRoute({
  children,
  requiredAuth = true,
}: ProtectedRouteProps) {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (requiredAuth && !auth.estaAutenticado) {
      navigate("/login");
    }
  }, [auth.estaAutenticado, requiredAuth, navigate]);

  if (requiredAuth && !auth.estaAutenticado) {
    return <div>Redirecionando...</div>;
  }

  return <>{children}</>;
}

// Uso
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/protected"
    element={
      <ProtectedRoute>
        <ProtectedPage />
      </ProtectedRoute>
    }
  />
</Routes>;
```

### 2. **Loader Functions** (React Router v6.4+)

```typescript
import { redirect } from "react-router";

// Função que executa antes de renderizar a rota
async function protectedLoader() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    throw redirect("/login");
  }

  return null;
}

// Configuração da rota
const router = createBrowserRouter([
  {
    path: "/protected",
    element: <ProtectedPage />,
    loader: protectedLoader,
  },
]);
```

## Padrões de Implementação

### 1. **Layout Wrapper**

```typescript
function Layout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet /> {/* Conteúdo da rota atual */}
      </main>
      <Footer />
    </div>
  );
}

<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="contact" element={<Contact />} />
  </Route>
</Routes>;
```

### 2. **Error Boundaries**

```typescript
import { useRouteError } from "react-router";

function ErrorPage() {
  const error = useRouteError();

  return (
    <div>
      <h1>Oops!</h1>
      <p>Algo deu errado.</p>
      <p>{error?.statusText || error?.message}</p>
    </div>
  );
}

// Configuração
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // suas rotas...
    ],
  },
]);
```

## Hooks Úteis

### 1. **useLocation**

```typescript
import { useLocation } from "react-router";

function MyComponent() {
  const location = useLocation();

  console.log(location.pathname); // "/protected"
  console.log(location.search); // "?tab=settings"
  console.log(location.state); // dados passados via navigate
}
```

### 2. **useNavigationType**

```typescript
import { useNavigationType } from "react-router";

function MyComponent() {
  const navigationType = useNavigationType();

  // "POP" = botão voltar/avançar
  // "PUSH" = navegação normal
  // "REPLACE" = substituição no histórico
}
```

## Performance e Otimizações

### 1. **Lazy Loading de Rotas**

```typescript
import { lazy, Suspense } from "react";

// Componentes carregados sob demanda
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 2. **Preloading**

```typescript
// Precarregar rota quando usuário passar o mouse
<Link
  to="/about"
  onMouseEnter={() => {
    // Precarrega o componente
    import("./pages/AboutPage");
  }}
>
  Sobre
</Link>
```

## Exercícios Práticos

1. **Adicione uma rota 404** para páginas não encontradas
2. **Implemente breadcrumbs** usando a localização atual
3. **Crie um sistema de tabs** com rotas aninhadas
4. **Adicione navegação condicional** baseada em permissões

## Configuração do Servidor

Para SPAs funcionarem corretamente, configure o servidor para retornar `index.html` para todas as rotas:

### **Nginx**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### **Apache**

```apache
RewriteEngine On
RewriteRule ^(?!api/) - [L]
RewriteRule ^(.*) /index.html [QSA,L]
```

### **Netlify**

```
/* /index.html 200
```

## Recursos Adicionais

- [Documentação Oficial React Router](https://reactrouter.com/)
- [Tutorial Interativo](https://reactrouter.com/en/main/start/tutorial)
- [Padrões de Roteamento](https://reactrouter.com/en/main/start/concepts)
