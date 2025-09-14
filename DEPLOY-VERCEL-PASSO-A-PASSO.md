# 🚀 Deploy no Vercel - Passo a Passo Detalhado

## ✅ Status Atual
- ✅ Código enviado para GitHub: `https://github.com/nperazzo6171/inspection-metrics-2024.git`
- ✅ Arquivos de configuração prontos
- 🔄 **Próximo**: Configurar banco e deploy

---

## 📋 **PASSO 1: Criar Banco no Neon** 🗄️

### 1.1 Acessar Neon Console
- ✅ **Já aberto**: https://console.neon.tech
- Faça login ou crie uma conta gratuita

### 1.2 Criar Projeto
1. Clique em **"New Project"**
2. **Nome**: `InspectionMetrics` ou `SGII`
3. **Região**: Escolha a mais próxima (ex: `US East`)
4. **PostgreSQL Version**: Deixe padrão
5. Clique **"Create Project"**

### 1.3 Copiar Connection String
1. Após criar, você verá o **Dashboard**
2. Procure por **"Connection String"** ou **"Database URL"**
3. **COPIE** a string completa (formato: `postgresql://username:password@host/database?sslmode=require`)
4. **SALVE** em um local seguro - você precisará no Vercel

**Exemplo da Connection String:**
```
postgresql://neondb_owner:abc123@ep-cool-lab-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 📋 **PASSO 2: Deploy no Vercel** 🌐

### 2.1 Acessar Vercel
- ✅ **Já aberto**: https://vercel.com
- Faça login com **GitHub** (recomendado)

### 2.2 Criar Novo Projeto
1. Clique em **"New Project"**
2. **Import Git Repository**
3. Procure por: `inspection-metrics-2024`
4. Clique **"Import"**

### 2.3 Configurar Deploy
1. **Project Name**: `sgii-inspection-metrics` (ou outro nome)
2. **Framework Preset**: Vercel detectará automaticamente
3. **Root Directory**: Deixe padrão (`.`)
4. **Build Command**: `npm run build` (já configurado)
5. **Output Directory**: `dist` (já configurado)

### 2.4 Configurar Variáveis de Ambiente
**IMPORTANTE**: Antes de fazer deploy, adicione as variáveis:

1. Clique em **"Environment Variables"**
2. Adicione estas variáveis:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | **Cole a Connection String do Neon** |
| `NODE_ENV` | `production` |

### 2.5 Fazer Deploy
1. Clique **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. ✅ **Deploy concluído!**

---

## 📋 **PASSO 3: Testar Aplicação** 🧪

### 3.1 Acessar URL
- Vercel fornecerá uma URL: `https://seu-projeto.vercel.app`
- Clique para abrir

### 3.2 Testar Login
- **Usuário**: `astec.admin`
- **Senha**: `Correpol@2025#BA`

### 3.3 Testar Funcionalidades
- ✅ Dashboard carrega
- ✅ Upload de dados funciona
- ✅ Filtros funcionam
- ✅ Relatórios são gerados
- ✅ Controle de prazos funciona
- ✅ Design responsivo

---

## 🔧 **Configurações Adicionais (Opcional)**

### Domínio Personalizado
1. No Vercel Dashboard → **"Domains"**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### SSL Automático
- ✅ **Já incluído** - Vercel configura automaticamente

---

## 🚨 **Solução de Problemas**

### Build Falhou?
1. Verifique logs no Vercel Dashboard
2. Confirme se `DATABASE_URL` está configurada
3. Verifique se todas as dependências estão no `package.json`

### Erro de Conexão com Banco?
1. Confirme se a Connection String está correta
2. Verifique se o banco Neon está ativo
3. Teste a conexão localmente primeiro

### Aplicação não carrega?
1. Verifique se o build foi bem-sucedido
2. Confirme as variáveis de ambiente
3. Verifique logs de runtime no Vercel

---

## 📞 **Suporte**

### Documentação
- **Vercel**: https://vercel.com/docs
- **Neon**: https://neon.tech/docs

### Logs e Monitoramento
- **Vercel Dashboard** → Functions → View Logs
- **Neon Dashboard** → Monitoring

---

## 🎉 **Parabéns!**

Seu sistema SGII está agora rodando em produção com:
- ✅ **Performance global** (CDN Vercel)
- ✅ **Banco PostgreSQL** gerenciado (Neon)
- ✅ **SSL automático**
- ✅ **Deploy automático** (push → deploy)
- ✅ **Custo zero** (tiers gratuitos)

**URL da aplicação**: `https://seu-projeto.vercel.app`

---

*💡 Dica: Salve este guia e a URL da aplicação para referência futura!*