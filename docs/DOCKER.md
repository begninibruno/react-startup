# Docker - Guia de Execução

Este guia explica como executar o projeto front-login usando Docker para desenvolvimento.

## 📋 Pré-requisitos

- Docker instalado na máquina
- Docker Desktop (recomendado para macOS/Windows)

## 🚀 Como Executar

### 1. Construir a Imagem Docker

No diretório raiz do projeto, execute:

```bash
docker build -t front-login .
```

### 2. Executar o Container

Para rodar o container com hot reload (mudanças em tempo real):

```bash
docker run --rm -i -p 5173:5173 -v $(pwd)/src:/app/src front-login
```

### 3. Acessar a Aplicação

Abra seu navegador e acesse:

```
http://localhost:5173
```

## 🔧 Explicação dos Parâmetros

### Comando Docker Run

```bash
docker run --rm -i -p 5173:5173 -v $(pwd)/src:/app/src front-login
```

**Parâmetros explicados:**

- `--rm`: Remove automaticamente o container quando ele for parado
- `-i`: Modo interativo (mantém STDIN aberto)
- `-p 5173:5173`: Mapeia a porta 5173 do container para a porta 5173 do host
- `-v $(pwd)/src:/app/src`: Monta o diretório `src` local no diretório `src` do container
- `front-login`: Nome da imagem Docker a ser executada

### Volume Mapping

O volume `-v $(pwd)/src:/app/src` permite que:

- ✅ Mudanças nos arquivos da pasta `src` sejam refletidas imediatamente no container
- ✅ O Vite detecte as mudanças e faça hot reload automático
- ✅ Você possa desenvolver normalmente sem precisar reconstruir a imagem

## 📁 Estrutura do Container

```
/app
├── package.json          # Copiado durante o build
├── node_modules/         # Instalado durante o build
├── src/                  # Montado via volume (tempo real)
├── public/               # Estático (necessário rebuild para mudanças)
└── outros arquivos...    # Estáticos (necessário rebuild para mudanças)
```

## 🔄 Workflows de Desenvolvimento

### Para mudanças no código (pasta src/)

- ✅ Edite os arquivos normalmente
- ✅ As mudanças aparecem automaticamente no navegador

### Para mudanças em dependências (package.json)

```bash
# Pare o container (Ctrl+C)
# Reconstrua a imagem
docker build -t front-login .
# Execute novamente
docker run --rm -i -p 5173:5173 -v $(pwd)/src:/app/src front-login
```

### Para mudanças em arquivos de configuração

```bash
# Pare o container (Ctrl+C)
# Reconstrua a imagem
docker build -t front-login .
# Execute novamente
docker run --rm -i -p 5173:5173 -v $(pwd)/src:/app/src front-login
```

## 🛠️ Comandos Úteis

### Parar o Container

```bash
# No terminal onde o container está rodando
Ctrl + C
```

### Verificar Containers Rodando

```bash
docker ps
```

### Remover a Imagem (se necessário)

```bash
docker rmi front-login
```

### Executar com Logs Detalhados

```bash
docker run --rm -i -p 5173:5173 -v $(pwd)/src:/app/src front-login --verbose
```

## 🐛 Troubleshooting

### Problema: Não consigo acessar localhost:5173

**Solução:** Verifique se:

- O container está rodando (`docker ps`)
- A porta não está sendo usada por outro processo
- O mapeamento de porta está correto (`-p 5173:5173`)

### Problema: Mudanças no código não aparecem

**Solução:** Verifique se:

- O volume está montado corretamente (`-v $(pwd)/src:/app/src`)
- Você está editando arquivos dentro da pasta `src/`
- O Vite está rodando em modo desenvolvimento

### Problema: Erro ao construir a imagem

**Solução:**

- Verifique se está no diretório correto do projeto
- Execute `docker system prune` para limpar cache
- Reconstrua com `docker build --no-cache -t front-login .`

## 📝 Notas Importantes

1. **Volume Parcial**: Estamos montando apenas a pasta `src/` para otimizar performance
2. **Hot Reload**: Funciona apenas para arquivos dentro de `src/`
3. **Dependencies**: Mudanças em `package.json` requerem rebuild da imagem
4. **Configurações**: Mudanças em arquivos de config (vite.config.ts, etc.) requerem rebuild

## 🔗 Links Relacionados

- [Dockerfile](../Dockerfile)
- [Configuração do Vite](../vite.config.ts)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Documentation](https://vitejs.dev/)
