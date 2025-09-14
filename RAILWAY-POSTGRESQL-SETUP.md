# 🐘 Railway - Configuração PostgreSQL

## Passo 1: Adicionar PostgreSQL no Railway

### 1.1 Acessar o Dashboard do Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login na sua conta
3. Selecione seu projeto **inspection-metrics-2024**

### 1.2 Adicionar Banco PostgreSQL
1. No dashboard do projeto, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. O Railway criará automaticamente uma instância PostgreSQL

## Passo 2: Configurar Variáveis de Ambiente

### 2.1 Obter URL de Conexão
1. Clique no serviço **PostgreSQL** que foi criado
2. Vá para a aba **"Variables"**
3. Copie a variável **DATABASE_URL** (ela será algo como: `postgresql://postgres:senha@host:porta/database`)

### 2.2 Configurar no Serviço da Aplicação
1. Volte para o serviço principal da aplicação (inspection-metrics-2024)
2. Vá para a aba **"Variables"**
3. Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://postgres:senha@host:porta/database
NODE_ENV=production
PORT=5000
```

## Passo 3: Verificar Configuração do Drizzle

### 3.1 Verificar drizzle.config.ts
O arquivo já deve estar configurado para usar a variável DATABASE_URL:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 3.2 Verificar Conexão no Código
O arquivo `server/db/index.ts` deve usar a DATABASE_URL:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

## Passo 4: Executar Migrações

### 4.1 Adicionar Script de Deploy
No `package.json`, certifique-se de ter:

```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsc -p tsconfig.json",
    "start": "cross-env NODE_ENV=production node dist/server/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  }
}
```

### 4.2 Executar Migrações no Railway
Após configurar as variáveis, o Railway fará redeploy automático. Se precisar executar migrações manualmente:

1. No Railway, vá para o serviço da aplicação
2. Na aba **"Deployments"**, clique no deployment ativo
3. Use o terminal integrado ou configure um script de inicialização

## Passo 5: Testar Conexão

### 5.1 Verificar Logs
1. No Railway, vá para a aba **"Logs"**
2. Procure por mensagens de conexão com o banco
3. Verifique se não há erros de DATABASE_URL

### 5.2 Testar Aplicação
1. Acesse a URL da aplicação no Railway
2. Teste funcionalidades que dependem do banco
3. Verifique se os dados são persistidos corretamente

## 🔧 Troubleshooting

### Erro: "DATABASE_URL não definido"
- Verifique se a variável DATABASE_URL foi configurada corretamente
- Certifique-se de que está no serviço correto (aplicação, não PostgreSQL)

### Erro de Conexão
- Verifique se o PostgreSQL está rodando no Railway
- Confirme se a URL de conexão está correta
- Teste a conexão localmente com as mesmas credenciais

### Migrações não Executadas
- Execute `npm run db:push` para sincronizar o schema
- Ou use `npm run db:migrate` se tiver arquivos de migração

## 📝 Próximos Passos

1. ✅ PostgreSQL configurado
2. ✅ Variáveis de ambiente definidas
3. 🔄 Testar aplicação com banco
4. 📊 Verificar se dados são persistidos
5. 🚀 Aplicação totalmente funcional!

---

**Dica**: O Railway oferece $5 de crédito gratuito por mês, suficiente para desenvolvimento e testes pequenos.