# 🚀 Deploy Simples - 3 Passos

## 1. 🗄️ Criar Banco (Neon)
1. Acesse: https://console.neon.tech
2. Crie conta → Novo projeto → Copie a **Connection String**

## 2. 📂 Subir no GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git
git push -u origin main
```

## 3. 🌐 Deploy (Vercel)
1. Acesse: https://vercel.com
2. Login com GitHub → New Project → Selecione seu repo
3. Adicione variável: `DATABASE_URL` = sua connection string
4. Deploy!

---

**✅ Pronto! Sua app estará online em poucos minutos.**

*Precisa de mais detalhes? Veja DEPLOY-INSTRUCTIONS.md*