# 🎣 Entendendo React Hooks

## O que são Hooks?

Hooks são funções especiais do React que permitem "conectar-se" a recursos do React como estado e ciclo de vida, mas apenas em componentes funcionais.

## Hooks Utilizados no Projeto

### 1. **useState** - Gerenciamento de Estado

```typescript
const [valor, setValor] = useState(valorInicial);
```

**Como funciona:**

- `valor`: o valor atual do estado
- `setValor`: função para atualizar o estado
- `valorInicial`: valor inicial do estado

**Exemplo do projeto:**

```typescript
// Estado simples
const [email, setEmail] = useState("");

// Estado com objeto
const [auth, setAuth] = useState({
  estaAutenticado: false,
  token: null,
  validandoPermissao: false,
});

// Atualizando estado
setEmail("novo@email.com");

// Atualizando estado com função (baseado no valor anterior)
setAuth((prev) => ({ ...prev, validandoPermissao: true }));
```

### 2. **useEffect** - Efeitos Colaterais

```typescript
useEffect(() => {
  // código do efeito
}, [dependências]);
```

**Variações de useEffect:**

```typescript
// 1. Executa apenas na montagem do componente
useEffect(() => {
  console.log("Componente montado");
}, []); // Array vazio

// 2. Executa a cada renderização
useEffect(() => {
  console.log("Toda renderização");
}); // Sem array de dependências

// 3. Executa quando dependências mudam
useEffect(() => {
  console.log("Auth mudou:", auth);
}, [auth]); // Executa quando 'auth' muda

// 4. Com cleanup (desmontagem)
useEffect(() => {
  const timer = setInterval(() => {}, 1000);

  // Função de cleanup
  return () => {
    clearInterval(timer);
  };
}, []);
```

**Exemplos do projeto:**

```typescript
// Validação quando componente monta
useEffect(() => {
  authContext?.validaUsuarioLogado();
}, []);

// Redirecionamento quando auth muda
useEffect(() => {
  if (authContext?.auth.estaAutenticado === false) {
    navigate("/");
  }
}, [authContext?.auth.estaAutenticado, navigate]);
```

### 3. **useContext** - Consumindo Context

```typescript
const context = useContext(MeuContext);
```

**Exemplo do projeto:**

```typescript
// Obtém o contexto de autenticação
const authContext = useContext(AuthContext);

// Usa dados do contexto
const isLoggedIn = authContext?.auth.estaAutenticado;

// Chama funções do contexto
authContext?.login(email, senha);
```

## Regras dos Hooks

### ⚠️ **Regras Importantes**

1. **Apenas no topo do componente**

```typescript
// ✅ Correto
function MyComponent() {
  const [state, setState] = useState("");

  return <div></div>;
}

// ❌ Incorreto
function MyComponent() {
  if (condition) {
    const [state, setState] = useState(""); // Erro!
  }
}
```

2. **Apenas em componentes funcionais ou hooks customizados**

```typescript
// ✅ Correto - Componente funcional
function MyComponent() {
  const [state, setState] = useState("");
}

// ✅ Correto - Hook customizado
function useMyHook() {
  const [state, setState] = useState("");
  return state;
}

// ❌ Incorreto - Função normal
function myFunction() {
  const [state, setState] = useState(""); // Erro!
}
```

3. **Ordem consistente**

```typescript
// ✅ Correto - mesma ordem sempre
function MyComponent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {}, []);
}

// ❌ Incorreto - ordem condicional
function MyComponent() {
  const [name, setName] = useState("");

  if (condition) {
    const [email, setEmail] = useState(""); // Erro!
  }

  useEffect(() => {}, []);
}
```

## Hooks Avançados (Para Estudar Depois)

### **useCallback** - Memorização de Funções

```typescript
const memoizedCallback = useCallback(() => {
  // função cara de calcular
}, [dependência]);
```

### **useMemo** - Memorização de Valores

```typescript
const memoizedValue = useMemo(() => {
  return calcularValorCaro(a, b);
}, [a, b]);
```

### **useReducer** - Estado Complexo

```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

### **useRef** - Referências Persistentes

```typescript
const inputRef = useRef(null);
```

## Criando Hooks Customizados

Um hook customizado é uma função que usa outros hooks:

```typescript
// Hook customizado para autenticação
function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}

// Hook customizado para localStorage
function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

## Padrões Comuns

### 1. **Loading States**

```typescript
function useApi(url: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}
```

### 2. **Debounced Values**

```typescript
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Exercícios Práticos

1. **Crie um hook customizado** `useLocalStorage` para persistir dados
2. **Implemente um hook** `useToggle` para alternar valores boolean
3. **Desenvolva um hook** `useApi` para fazer requisições HTTP
4. **Crie um contador** usando apenas hooks, sem classes

## Dicas de Performance

1. **Use useCallback para funções**:

```typescript
const handleClick = useCallback(() => {
  // lógica
}, [dependências]);
```

2. **Use useMemo para cálculos caros**:

```typescript
const expensiveValue = useMemo(() => {
  return calcularValorCaro(data);
}, [data]);
```

3. **Cuidado com dependências de useEffect**:

```typescript
// ❌ Pode causar loop infinito
useEffect(() => {
  setData({ ...data, newProp: "value" });
}, [data]);

// ✅ Melhor
useEffect(() => {
  setData((prev) => ({ ...prev, newProp: "value" }));
}, []); // ou [specificProperty]
```

## Recursos Adicionais

- [Documentação Oficial dos Hooks](https://react.dev/reference/react)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [Hooks Customizados](https://react.dev/learn/reusing-logic-with-custom-hooks)
