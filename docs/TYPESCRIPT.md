# 📝 TypeScript no React

## Por que TypeScript?

TypeScript adiciona tipagem estática ao JavaScript, oferecendo:

- **Detecção de erros** em tempo de desenvolvimento
- **Autocompletar** inteligente no editor
- **Refatoração** mais segura
- **Documentação viva** através dos tipos
- **Melhor colaboração** em equipe

## Tipos Básicos do Projeto

### 1. **Interface para Context**

```typescript
// Define o formato exato dos dados do contexto
interface AuthContextType {
  auth: {
    estaAutenticado: boolean; // true/false
    token: string | null; // string ou null
    validandoPermissao: boolean; // estado de loading
  };
  login: (email: string, senha: string) => Promise<void>; // função async
  logout: () => void; // função simples
  validaUsuarioLogado: () => Promise<void>; // função async
}
```

### 2. **Tipos para Props de Componentes**

```typescript
// Props tipadas para componentes
interface LoginPageProps {
  title?: string; // prop opcional
  onSubmit: (data: any) => void; // prop obrigatória
}

function LoginPage({ title = "Login", onSubmit }: LoginPageProps) {
  // TypeScript sabe que title sempre será string
  // e onSubmit sempre será uma função
}
```

### 3. **Tipos para Estados**

```typescript
// Estado tipado
interface User {
  id: number;
  name: string;
  email: string;
  permissions: string[];
}

// TypeScript infere o tipo automaticamente
const [user, setUser] = useState<User | null>(null);

// Agora TypeScript sabe que user pode ser User ou null
if (user) {
  console.log(user.name); // ✅ OK - TypeScript sabe que user existe
}
```

## Tipos Avançados

### 1. **Union Types**

```typescript
// Variável que pode ser string OU number
type Status = "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("loading");

// TypeScript só permite esses valores
setStatus("success"); // ✅ OK
setStatus("invalid"); // ❌ Erro!
```

### 2. **Generics**

```typescript
// Função que funciona com qualquer tipo
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  // ... lógica
  return [value, setValue] as const;
}

// Uso
const [user, setUser] = useLocalStorage<User | null>("user", null);
const [theme, setTheme] = useLocalStorage<string>("theme", "light");
```

### 3. **Utility Types**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial - todas as propriedades opcionais
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; }

// Pick - seleciona propriedades específicas
type UserPublic = Pick<User, "id" | "name" | "email">;
// { id: number; name: string; email: string; }

// Omit - exclui propriedades específicas
type UserWithoutPassword = Omit<User, "password">;
// { id: number; name: string; email: string; }
```

## Tipagem de Hooks

### 1. **useState com tipos específicos**

```typescript
// Tipo inferido automaticamente
const [count, setCount] = useState(0); // number

// Tipo explícito
const [user, setUser] = useState<User | null>(null);

// Array de objetos
const [items, setItems] = useState<Item[]>([]);

// Estado complexo
interface FormState {
  email: string;
  password: string;
  isValid: boolean;
}

const [form, setForm] = useState<FormState>({
  email: "",
  password: "",
  isValid: false,
});
```

### 2. **useEffect tipado**

```typescript
// useEffect é tipado automaticamente
useEffect(() => {
  // função de cleanup é opcional e tipada
  return () => {
    console.log("Cleanup");
  };
}, []); // dependências tipadas automaticamente

// Função async dentro de useEffect
useEffect(() => {
  async function fetchData() {
    const response = await fetch("/api/data");
    const data: ApiResponse = await response.json();
    setData(data);
  }

  fetchData();
}, []);
```

### 3. **useContext tipado**

```typescript
// Context tipado
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook customizado com verificação de tipo
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context; // TypeScript sabe que não é undefined
}
```

## Tipagem de Eventos

### 1. **Event Handlers**

```typescript
function LoginForm() {
  // Evento de formulário
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ...
  };

  // Evento de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // TypeScript sabe que é string
    setEmail(value);
  };

  // Evento de botão
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Clicado!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
      <button onClick={handleClick}>Enviar</button>
    </form>
  );
}
```

### 2. **Ref Types**

```typescript
import { useRef } from "react";

// Ref para elemento HTML
const inputRef = useRef<HTMLInputElement>(null);

// Verificação antes de usar
if (inputRef.current) {
  inputRef.current.focus(); // ✅ OK
}

// Ref para valor mutável
const countRef = useRef<number>(0);
countRef.current = 10; // ✅ OK
```

## Tipagem de APIs

### 1. **Response Types**

```typescript
// Tipo da resposta da API
interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  expiresIn: number;
}

// Função tipada
async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login falhou");
  }

  return response.json(); // TypeScript sabe que retorna LoginResponse
}
```

### 2. **Error Types**

```typescript
// Tipo customizado para erros da API
interface ApiError {
  message: string;
  code: number;
  details?: string;
}

// Função que pode retornar erro tipado
async function fetchData(): Promise<Data | ApiError> {
  try {
    const response = await fetch("/api/data");

    if (!response.ok) {
      return {
        message: "Erro na requisição",
        code: response.status,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      message: "Erro de rede",
      code: 0,
    };
  }
}
```

## Dicas Práticas

### 1. **Inferência de Tipos**

```typescript
// TypeScript infere automaticamente
const user = {
  name: "João",
  age: 30,
}; // TypeScript sabe que é { name: string; age: number; }

// Deixe o TypeScript inferir quando possível
const [items] = useState([]); // any[] - não ideal
const [items] = useState<Item[]>([]); // Item[] - melhor
const [items] = useState(() => [] as Item[]); // Item[] - alternativa
```

### 2. **Type Guards**

```typescript
// Função para verificar tipos em runtime
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === "number" && typeof obj.name === "string";
}

// Uso
if (isUser(data)) {
  console.log(data.name); // TypeScript sabe que é User
}
```

### 3. **Assertions (use com cuidado)**

```typescript
// Forçar um tipo (use apenas quando tem certeza)
const element = document.getElementById("root") as HTMLElement;

// Alternativa mais segura
const element = document.getElementById("root");
if (element) {
  // usar element aqui
}
```

## Configuração TypeScript

### 1. **tsconfig.json básico**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 2. **Strict Mode**

```json
{
  "compilerOptions": {
    "strict": true, // Habilita todas as verificações
    "noImplicitAny": true, // Erro para 'any' implícito
    "noImplicitReturns": true, // Erro se função não retorna sempre
    "noImplicitThis": true, // Erro para 'this' implícito
    "noUnusedLocals": true, // Aviso para variáveis não usadas
    "noUnusedParameters": true // Aviso para parâmetros não usados
  }
}
```

## Erros Comuns e Soluções

### 1. **Object is possibly undefined**

```typescript
// ❌ Erro
const user = getUser();
console.log(user.name); // Erro: user pode ser undefined

// ✅ Solução
if (user) {
  console.log(user.name);
}

// ✅ Ou use optional chaining
console.log(user?.name);
```

### 2. **Argument of type 'string | undefined' is not assignable**

```typescript
// ❌ Erro
const email = formData.get("email"); // string | FormDataEntryValue | null
setEmail(email); // Erro: tipos incompatíveis

// ✅ Solução
const email = formData.get("email")?.toString() || "";
setEmail(email);
```

### 3. **No overload matches this call**

```typescript
// ❌ Erro
setState(newValue); // Tipo errado

// ✅ Solução - verifique o tipo esperado
setState(newValue as ExpectedType);
// ou
setState(newValue); // e ajuste o tipo de newValue
```

## Exercícios Práticos

1. **Tipagem de formulário** completo com validação
2. **Interface para API** de usuários com CRUD
3. **Hook customizado** para fetch com tipos
4. **Componente genérico** que aceita diferentes tipos
5. **Type guards** para validação de dados da API

## Recursos Adicionais

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
