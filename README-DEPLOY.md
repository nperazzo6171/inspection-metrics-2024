# Guia de Deploy - InspectionMetrics

Este guia explica como fazer o deploy do sistema InspectionMetrics utilizando Neon PostgreSQL para o banco de dados e Vercel para a aplicação.

## Pré-requisitos

- Conta no [Neon PostgreSQL](https://neon.tech)
- Conta no [Vercel](https://vercel.com)
- Git instalado no seu computador

## 1. Configuração do Banco de Dados no Neon

### 1.1. Criar um projeto no Neon

1. Acesse [console.neon.tech](https://console.neon.tech) e faça login
2. Clique em "New Project"
3. Dê um nome ao projeto (ex: "inspection-metrics")
4. Escolha a região mais próxima do seu público-alvo
5. Clique em "Create Project"

### 1.2. Obter a string de conexão

1. No dashboard do projeto, vá para a aba "Connection Details"
2. Selecione "Connection string" e copie a string de conexão
3. Guarde esta string para usar mais tarde no Vercel

### 1.3. Criar as tabelas no banco de dados

Você tem duas opções para criar as tabelas:

#### Opção 1: Executar as migrações localmente

1. Clone o repositório do projeto
2. Crie um arquivo `.env` na raiz do projeto
3. Adicione a string de conexão do Neon:
   ```
   DATABASE_URL=sua_string_de_conexao_do_neon
   ```
4. Execute o comando para aplicar as migrações:
   ```bash
   npm run db:push
   ```

#### Opção 2: Executar as migrações durante o primeiro deploy

As migrações serão executadas automaticamente durante o primeiro deploy se você configurar a variável de ambiente `DATABASE_URL` no Vercel.

## 2. Deploy da Aplicação no Vercel

### 2.1. Preparar o repositório

1. Certifique-se de que seu código está em um repositório Git (GitHub, GitLab, Bitbucket)
2. Verifique se o arquivo `vercel.json` está na raiz do projeto

### 2.2. Configurar o projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New" > "Project"
3. Importe o repositório do seu projeto
4. Configure as variáveis de ambiente:
   - `DATABASE_URL`: Cole a string de conexão do Neon PostgreSQL
   - `NODE_ENV`: production
5. Clique em "Deploy"

### 2.3. Verificar o deploy

1. Aguarde o processo de build e deploy finalizar
2. Acesse a URL fornecida pelo Vercel para verificar se a aplicação está funcionando
3. Teste o login e outras funcionalidades para garantir que a conexão com o banco de dados está correta

## 3. Configurações Adicionais (Opcional)

### 3.1. Configurar domínio personalizado

1. No dashboard do projeto no Vercel, vá para "Settings" > "Domains"
2. Adicione seu domínio personalizado e siga as instruções

### 3.2. Configurar variáveis de ambiente adicionais

Se sua aplicação precisar de outras variáveis de ambiente além do `DATABASE_URL`, adicione-as nas configurações do projeto no Vercel.

## 4. Solução de Problemas

### 4.1. Erro de conexão com o banco de dados

- Verifique se a string de conexão está correta
- Confirme se o IP do Vercel está na lista de IPs permitidos no Neon (por padrão, o Neon permite conexões de qualquer IP)
- Verifique os logs de deploy no Vercel para identificar possíveis erros

### 4.2. Erro no build

- Verifique os logs de build no Vercel
- Certifique-se de que todas as dependências estão instaladas corretamente
- Verifique se o arquivo `vercel.json` está configurado corretamente

## 5. Manutenção

### 5.1. Atualizações

Para atualizar a aplicação, basta fazer push das alterações para o repositório. O Vercel detectará automaticamente as mudanças e fará um novo deploy.

### 5.2. Monitoramento

- Use o dashboard do Vercel para monitorar o status da aplicação
- Use o dashboard do Neon para monitorar o banco de dados

## 6. Backup do Banco de Dados

O Neon PostgreSQL oferece backups automáticos. Para fazer um backup manual:

1. Acesse o dashboard do projeto no Neon
2. Vá para a aba "Branches"
3. Crie uma nova branch a partir da branch principal
4. Esta nova branch conterá uma cópia dos dados no momento da criação

---

Para qualquer dúvida adicional, consulte a documentação oficial do [Neon PostgreSQL](https://neon.tech/docs) e do [Vercel](https://vercel.com/docs).