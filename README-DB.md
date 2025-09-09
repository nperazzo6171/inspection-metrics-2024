# Configuração do Banco de Dados PostgreSQL Local

Este documento contém instruções para configurar um banco de dados PostgreSQL local para o projeto InspectionMetrics.

## Pré-requisitos

- PostgreSQL instalado no seu sistema
  - [Download PostgreSQL](https://www.postgresql.org/download/)

## Opção 1: Configuração Automática

O projeto inclui um script que facilita a configuração do banco de dados local:

```bash
npm run db:setup
```

Este script irá:
1. Verificar se o PostgreSQL está instalado
2. Solicitar informações de conexão (usuário, senha, host, porta)
3. Criar o banco de dados se não existir
4. Atualizar o arquivo `.env` com a string de conexão
5. Opcionalmente executar as migrações do banco de dados

## Opção 2: Configuração Manual

Se preferir configurar manualmente, siga estes passos:

### 1. Criar o banco de dados

```sql
CREATE DATABASE inspection_metrics;
```

### 2. Configurar o arquivo .env

Edite o arquivo `.env` na raiz do projeto e configure a variável `DATABASE_URL`:

```
DATABASE_URL=postgres://seu_usuario:sua_senha@localhost:5432/inspection_metrics
```

Substitua `seu_usuario` e `sua_senha` pelas suas credenciais do PostgreSQL.

### 3. Executar as migrações

```bash
npm run db:push
```

## Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas:

- **users**: Armazena informações de usuários do sistema
- **inspections**: Registros de inspeções realizadas
- **controle_prazos**: Controle de prazos para regularização de não conformidades

## Solução de Problemas

### Erro de conexão

Se você encontrar erros de conexão, verifique:

1. Se o PostgreSQL está em execução
2. Se as credenciais no arquivo `.env` estão corretas
3. Se o banco de dados foi criado corretamente

### Erro nas migrações

Se as migrações falharem, você pode tentar executá-las manualmente:

```bash
npx drizzle-kit push:pg
```

## Desenvolvimento sem Banco de Dados

O projeto foi configurado para funcionar em modo de desenvolvimento mesmo sem uma conexão de banco de dados ativa. Neste caso, algumas funcionalidades que dependem do banco de dados não estarão disponíveis, mas você poderá navegar pela interface e testar outras funcionalidades.