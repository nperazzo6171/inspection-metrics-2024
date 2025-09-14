#!/bin/bash
# Script de Deploy para DigitalOcean
# Execute este script no seu Droplet Ubuntu

set -e

echo "🚀 Iniciando deploy do SGII no DigitalOcean..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
echo "📦 Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Instalar Nginx
echo "📦 Instalando Nginx..."
sudo apt install -y nginx

# Clonar projeto (substitua pela sua URL)
echo "📂 Clonando projeto..."
if [ -d "inspection-metrics" ]; then
    cd inspection-metrics
    git pull
else
    git clone https://github.com/SEU_USUARIO/inspection-metrics.git
    cd inspection-metrics
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build da aplicação
echo "🔨 Fazendo build..."
npm run build

# Configurar variáveis de ambiente
echo "⚙️ Configurando variáveis..."
if [ ! -f ".env" ]; then
    echo "DATABASE_URL=sua_connection_string_aqui" > .env
    echo "NODE_ENV=production" >> .env
    echo "PORT=5000" >> .env
    echo "⚠️ IMPORTANTE: Edite o arquivo .env com sua DATABASE_URL real!"
fi

# Parar PM2 se estiver rodando
echo "🔄 Parando aplicação anterior..."
pm2 stop sgii 2>/dev/null || true
pm2 delete sgii 2>/dev/null || true

# Iniciar com PM2
echo "🚀 Iniciando aplicação..."
pm2 start npm --name "sgii" -- start
pm2 startup
pm2 save

# Configurar Nginx
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/sgii > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/sgii /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
echo "🔧 Configurando Nginx..."
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar firewall
echo "🔒 Configurando firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Deploy concluído!"
echo ""
echo "🌐 Sua aplicação está rodando em:"
echo "   http://$(curl -s ifconfig.me)"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite o arquivo .env com sua DATABASE_URL real"
echo "2. Reinicie a aplicação: pm2 restart sgii"
echo "3. Configure SSL com Let's Encrypt (opcional)"
echo ""
echo "🔧 Comandos úteis:"
echo "   pm2 status          - Ver status da aplicação"
echo "   pm2 logs sgii       - Ver logs"
echo "   pm2 restart sgii    - Reiniciar aplicação"
echo "   sudo nginx -t       - Testar configuração Nginx"
echo ""
echo "🎉 SGII está online!"