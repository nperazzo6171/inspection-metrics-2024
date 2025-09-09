/**
 * Script para preparar o deploy no Vercel com Neon PostgreSQL
 * 
 * Este script ajuda a preparar o ambiente para deploy no Vercel
 * com banco de dados Neon PostgreSQL.
 */

import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n===== Preparação para Deploy no Vercel com Neon PostgreSQL =====\n');

// Verificar se os arquivos necessários existem
const checkRequiredFiles = () => {
  const requiredFiles = [
    'vercel.json',
    'package.json',
    'drizzle.config.ts',
    'shared/schema.ts'
  ];

  const missingFiles = [];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    console.error(`❌ Arquivos necessários não encontrados: ${missingFiles.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Todos os arquivos necessários encontrados');
};

// Perguntar informações de conexão do Neon PostgreSQL
const askNeonInfo = () => {
  return new Promise((resolve) => {
    rl.question('URL de conexão do Neon PostgreSQL: ', (connectionUrl) => {
      if (!connectionUrl) {
        console.error('❌ URL de conexão é obrigatória');
        process.exit(1);
      }
      
      resolve({ connectionUrl });
    });
  });
};

// Atualizar o arquivo .env.production
const updateEnvProduction = async (neonInfo) => {
  const { connectionUrl } = neonInfo;
  
  console.log('\nAtualizando arquivo .env.production...');
  
  try {
    const envPath = path.join(__dirname, '..', '.env.production');
    const envContent = `# Variáveis de ambiente para produção\nDATABASE_URL=${connectionUrl}\nNODE_ENV=production\n`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env.production criado com sucesso');
    
    return connectionUrl;
  } catch (error) {
    console.error(`❌ Erro ao criar arquivo .env.production: ${error.message}`);
    process.exit(1);
  }
};

// Verificar se o build funciona localmente
const testBuild = () => {
  console.log('\nTestando build do projeto...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build concluído com sucesso');
  } catch (error) {
    console.error(`❌ Erro durante o build: ${error.message}`);
    console.log('Corrija os erros antes de fazer o deploy');
    process.exit(1);
  }
};

// Instruções para deploy no Vercel
const showVercelInstructions = (connectionUrl) => {
  console.log('\n===== Instruções para Deploy no Vercel =====\n');
  console.log('1. Acesse https://vercel.com e faça login');
  console.log('2. Importe seu repositório Git');
  console.log('3. Configure as seguintes variáveis de ambiente:');
  console.log(`   - DATABASE_URL: ${connectionUrl}`);
  console.log('   - NODE_ENV: production');
  console.log('4. Clique em "Deploy"');
  console.log('\nPara mais detalhes, consulte o arquivo README-DEPLOY.md');
};

// Função principal
const main = async () => {
  try {
    checkRequiredFiles();
    
    const neonInfo = await askNeonInfo();
    const connectionUrl = await updateEnvProduction(neonInfo);
    
    console.log('\nDeseja testar o build do projeto localmente? (s/n)');
    rl.question('', (answer) => {
      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        testBuild();
      }
      
      showVercelInstructions(connectionUrl);
      
      console.log('\n✅ Preparação concluída!');
      rl.close();
    });
  } catch (error) {
    console.error(`❌ Erro durante a preparação: ${error.message}`);
    rl.close();
    process.exit(1);
  }
};

// Executar o script
main();