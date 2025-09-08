# 📚 Entendendo o Context API

## O que é o Context API?

O Context API é uma ferramenta do React que resolve o problema de "prop drilling" - quando você precisa passar dados através de vários níveis de componentes.

### Problema sem Context:

```
App
├── Header (precisa do usuário)
│   ├── Navigation (não usa usuário)
│   │   └── UserMenu (precisa do usuário) ❌
│   └── Logo
└── Main
    └── Content (precisa do usuário)
```

### Solução com Context:

```
App (Provider)
├── Header (useContext) ✅
│   ├── Navigation
│   │   └── UserMenu (useContext) ✅
│   └── Logo
└── Main
    └── Content (useContext) ✅
```

## Como Funciona no Nosso Projeto

### 1. **Criação do Context** (`AuthContext.tsx`)

```typescript
// 1. Definir o tipo dos dados
interface AuthContextType {
  auth: {
    /* dados de autenticação */
  };
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

// 2. Criar o Context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
```

### 2. **Provider Component**

```typescript
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Estado que será compartilhado
  const [auth, setAuth] = useState({
    estaAutenticado: false,
    token: null,
    validandoPermissao: false,
  });

  // Funções que serão compartilhadas
  const login = async (email: string, senha: string) => {
    // lógica de login
  };

  // Fornece os dados para todos os filhos
  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. **Consumindo o Context**

```typescript
function LoginPage() {
  // Obtém os dados do context
  const authContext = useContext(AuthContext);

  // Usa as funções do context
  const handleLogin = () => {
    authContext?.login(email, senha);
  };
}
```

## Quando Usar Context API

### ✅ **Use quando:**

- Dados precisam ser acessados por vários componentes
- Evitar prop drilling
- Estado global simples (autenticação, tema, idioma)

### ❌ **Não use quando:**

- Estado é usado apenas localmente
- Performance é crítica (Context re-renderiza todos os consumidores)
- Estado é muito complexo (considere Redux/Zustand)

## Pattern Provider

### Estrutura Recomendada:

```typescript
// 1. Interface dos dados
interface MyContextType {
  data: any;
  actions: () => void;
}

// 2. Context com valor inicial
const MyContext = createContext<MyContextType | undefined>(undefined);

// 3. Provider component
export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState(initialState);

  const actions = () => {
    // lógica das ações
  };

  return (
    <MyContext.Provider value={{ data, actions }}>
      {children}
    </MyContext.Provider>
  );
};

// 4. Hook customizado (opcional)
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext deve ser usado dentro de MyProvider");
  }
  return context;
};
```

## Otimizações

### 1. **Separar Contexts por Responsabilidade**

```typescript
// Em vez de um context gigante:
const AppContext = createContext({ user, theme, notifications, ... });

// Prefira contexts específicos:
const AuthContext = createContext({ user, login, logout });
const ThemeContext = createContext({ theme, toggleTheme });
const NotificationContext = createContext({ notifications, addNotification });
```

### 2. **Memorização para Performance**

```typescript
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(initialState);

  // Memoriza o valor para evitar re-renders desnecessários
  const value = useMemo(
    () => ({
      auth,
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## Exercícios Práticos

1. **Crie um ThemeContext** para alternar entre tema claro/escuro
2. **Adicione um NotificationContext** para mostrar mensagens
3. **Implemente um hook customizado** `useAuth()` para o AuthContext
4. **Teste a performance** removendo/adicionando o useMemo

## Recursos Adicionais

- [Documentação Oficial do React Context](https://react.dev/reference/react/createContext)
- [Quando usar Context vs Props](https://react.dev/learn/passing-data-deeply-with-context)
- [Padrões de Context API](https://kentcdodds.com/blog/how-to-use-react-context-effectively)
