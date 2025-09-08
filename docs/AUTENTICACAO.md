# 🔐 Entendendo Autenticação Frontend

## Conceitos Fundamentais

### O que é Autenticação?

**Autenticação** é o processo de verificar a identidade de um usuário. É diferente de **autorização**, que determina o que um usuário pode fazer.

- **Autenticação**: "Quem é você?" (Login/Senha)
- **Autorização**: "O que você pode fazer?" (Permissões)

## Fluxo de Autenticação

### 1. **Fluxo Tradicional (Session-based)**

```
1. Usuário faz login
2. Servidor cria sessão e retorna cookie
3. Browser automaticamente envia cookie nas próximas requisições
4. Servidor valida sessão a cada requisição
```

### 2. **Fluxo Moderno (Token-based/JWT)**

```
1. Usuário faz login
2. Servidor retorna token JWT
3. Frontend armazena token
4. Frontend envia token no header Authorization
5. Servidor valida token a cada requisição
```

## Implementação no Projeto

### 1. **Estado de Autenticação**

```typescript
interface AuthState {
  estaAutenticado: boolean; // Se o usuário está logado
  token: string | null; // Token de autenticação
  validandoPermissao: boolean; // Estado de loading
  usuario?: User; // Dados do usuário (opcional)
}
```

### 2. **Ações de Autenticação**

```typescript
// LOGIN
async function login(email: string, senha: string) {
  try {
    setLoading(true);

    // Chama API de login
    const response = await loginUser(email, senha);

    if (response.token) {
      // Salva token e atualiza estado
      setAuth({
        estaAutenticado: true,
        token: response.token,
        validandoPermissao: false,
        usuario: response.user,
      });

      // Opcional: salvar no localStorage
      localStorage.setItem("token", response.token);
    }
  } catch (error) {
    // Tratar erro de login
    console.error("Erro no login:", error);
  } finally {
    setLoading(false);
  }
}

// LOGOUT
function logout() {
  // Limpa estado
  setAuth({
    estaAutenticado: false,
    token: null,
    validandoPermissao: false,
    usuario: undefined,
  });

  // Remove do storage
  localStorage.removeItem("token");

  // Redireciona para login
  navigate("/login");
}

// VALIDAÇÃO
async function validarToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    logout();
    return;
  }

  try {
    setValidando(true);

    // Valida token no backend
    const response = await validateToken(token);

    if (response.valid) {
      setAuth({
        estaAutenticado: true,
        token,
        validandoPermissao: false,
        usuario: response.user,
      });
    } else {
      logout();
    }
  } catch (error) {
    logout();
  } finally {
    setValidando(false);
  }
}
```

## Persistência de Sessão

### 1. **localStorage vs sessionStorage vs Cookies**

```typescript
// localStorage - Persiste até ser removido manualmente
localStorage.setItem("token", token);
const token = localStorage.getItem("token");

// sessionStorage - Persiste apenas durante a sessão do browser
sessionStorage.setItem("token", token);
const token = sessionStorage.getItem("token");

// Cookies - Podem ter expiração automática
document.cookie = `token=${token}; max-age=3600; secure; httpOnly`;
```

### 2. **Recuperação de Sessão**

```typescript
// Hook para recuperar sessão ao inicializar app
useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    // Valida se token ainda é válido
    validarToken();
  } else {
    // Marca como não autenticado
    setAuth((prev) => ({ ...prev, validandoPermissao: false }));
  }
}, []);
```

## Proteção de Rotas

### 1. **HOC (Higher-Order Component)**

```typescript
function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
      if (!auth.estaAutenticado && !auth.validandoPermissao) {
        navigate("/login");
      }
    }, [auth, navigate]);

    if (!auth.estaAutenticado) {
      return <div>Redirecionando...</div>;
    }

    return <Component {...props} />;
  };
}

// Uso
const ProtectedDashboard = withAuth(Dashboard);
```

### 2. **Route Guard Component**

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

function ProtectedRoute({
  children,
  requiredPermissions,
}: ProtectedRouteProps) {
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.estaAutenticado) {
      navigate("/login", {
        state: { from: location.pathname }, // Para retornar após login
      });
      return;
    }

    // Verifica permissões específicas
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.every((permission) =>
        auth.usuario?.permissions?.includes(permission)
      );

      if (!hasPermission) {
        navigate("/unauthorized");
        return;
      }
    }
  }, [auth, navigate, requiredPermissions]);

  if (auth.validandoPermissao) {
    return <LoadingScreen />;
  }

  if (!auth.estaAutenticado) {
    return null;
  }

  return <>{children}</>;
}
```

## Interceptors para APIs

### 1. **Axios Interceptors**

```typescript
import axios from "axios";

// Configuração base
const api = axios.create({
  baseURL: "https://api.meuapp.com",
});

// Interceptor de requisição - adiciona token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta - trata expiração de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
```

### 2. **Fetch com Wrapper**

```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    // Token expirado
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Token expirado");
  }

  return response;
}
```

## Refresh Tokens

### 1. **Implementação Básica**

```typescript
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data: TokenResponse = await response.json();

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      return data.accessToken;
    }
  } catch (error) {
    console.error("Erro ao renovar token:", error);
  }

  // Se não conseguiu renovar, faz logout
  logout();
  return null;
}
```

### 2. **Auto-renovação**

```typescript
// Hook para auto-renovação de token
function useTokenRefresh() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Decodifica JWT para verificar expiração
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Renova 5 minutos antes da expiração
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

      const timer = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, []);
}
```

## Segurança

### ⚠️ **Pontos Importantes**

1. **Nunca valide credenciais no frontend**

```typescript
// ❌ NUNCA faça isso
if (password === "senha123") {
  setLoggedIn(true);
}

// ✅ Sempre valide no backend
const response = await fetch("/api/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
```

2. **Proteja tokens sensíveis**

```typescript
// ❌ Evite localStorage para tokens muito sensíveis
localStorage.setItem("token", sensitiveToken);

// ✅ Considere httpOnly cookies para alta segurança
// (definido pelo backend)
```

3. **Implemente logout em todos os tabs**

```typescript
// Escuta mudanças no localStorage em outras abas
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "token" && e.newValue === null) {
      // Token foi removido em outra aba
      logout();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);
```

4. **Timeout por inatividade**

```typescript
function useInactivityTimeout(timeoutMs: number = 30 * 60 * 1000) {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, timeoutMs);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Inicia o timer

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [timeoutMs]);
}
```

## Exercícios Práticos

1. **Implemente persistência** com localStorage
2. **Adicione refresh token** automático
3. **Crie sistema de permissões** por usuário
4. **Implemente logout** em múltiplas abas
5. **Adicione timeout** por inatividade

## Recursos Adicionais

- [JWT.io - Debugger de tokens](https://jwt.io/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [React Security Best Practices](https://blog.logrocket.com/react-security-authentication/)
