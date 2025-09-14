# 🚨 URGENTE: Executar Migrations no Railway

## Problema Identificado

A aplicação está conectando com o banco de dados, mas as **tabelas não existem**. Os erros mostram:

```
PostgresError: relation "users" does not exist
PostgresError: relation "inspections" does not exist  
PostgresError: relation "controle_prazos" does not exist
```

## Solução: Executar Migrations do Drizzle

### Opção 1: Via Railway Dashboard (RECOMENDADO)

1. **Acesse o Railway Dashboard**
   - Vá para [railway.app](https://railway.app)
   - Entre no seu projeto

2. **Acesse o Terminal do Container**
   - Clique no serviço da aplicação
   - Vá para a aba "Deployments"
   - Clique no deployment ativo
   - Procure por "Terminal" ou "Shell"

3. **Execute o comando de migration**
   ```bash
   npm run db:push
   ```
   
   OU diretamente:
   ```bash
   npx drizzle-kit push
   ```

### Opção 2: Adicionar ao Script de Start

1. **Modificar o package.json** (temporariamente)
   - Alterar o script "start" para:
   ```json
   "start": "npm run db:push && cross-env NODE_ENV=production node dist/index.js"
   ```

2. **Fazer commit e push**
   ```bash
   git add package.json
   git commit -m "Add database migration to start script"
   git push
   ```

3. **Aguardar redeploy automático**

### Opção 3: Criar Script de Inicialização

1. **Criar arquivo `railway-init.sh`**
   ```bash
   #!/bin/bash
   echo "Executando migrations..."
   npm run db:push
   echo "Iniciando aplicação..."
   npm start
   ```

2. **Modificar Dockerfile** (se existir) ou package.json

## Verificação

Após executar as migrations, os logs devem mostrar:
- ✅ Tabelas criadas com sucesso
- ✅ Aplicação iniciando sem erros de "relation does not exist"
- ✅ Conexão com banco funcionando

## Comandos Disponíveis

- `npm run db:push` - Sincroniza schema com banco
- `npx drizzle-kit push` - Comando direto do Drizzle
- `npx drizzle-kit generate` - Gera arquivos de migration

## Status Atual

- ✅ Código corrigido (postgres-js instalado)
- ✅ DATABASE_URL configurada
- ✅ Aplicação conectando com banco
- ❌ **TABELAS NÃO EXISTEM** ← PROBLEMA ATUAL
- ⏳ Aguardando execução das migrations

---

**AÇÃO IMEDIATA NECESSÁRIA:** Executar `npm run db:push` no Railway para criar as tabelas!