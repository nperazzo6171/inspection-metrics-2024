/**
 * Script para configurar o banco de dados PostgreSQL local
 * 
 * Este script ajuda a criar o banco de dados e as tabelas necessárias
 * para o projeto InspectionMetrics.
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

console.log('\n===== Configuração do Banco de Dados PostgreSQL Local =====\n');

// Verificar se o PostgreSQL está instalado
try {
  execSync('psql --version', { stdio: 'ignore' });
  console.log('✅ PostgreSQL encontrado no sistema');
} catch (error) {
  console.error('❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL antes de continuar.');
  console.log('   Download: https://www.postgresql.org/download/');
  process.exit(1);
}

// Perguntar informações de conexão
const askDatabaseInfo = () => {
  return new Promise((resolve) => {
    rl.question('Nome do usuário PostgreSQL (padrão: postgres): ', (username) => {
      username = username || 'postgres';
      
      rl.question('Senha do PostgreSQL (padrão: postgres): ', (password) => {
        password = password || 'postgres';
        
        rl.question('Host do PostgreSQL (padrão: localhost): ', (host) => {
          host = host || 'localhost';
          
          rl.question('Porta do PostgreSQL (padrão: 5432): ', (port) => {
            port = port || '5432';
            
            rl.question('Nome do banco de dados a ser criado (padrão: inspection_metrics): ', (dbName) => {
              dbName = dbName || 'inspection_metrics';
              
              resolve({ username, password, host, port, dbName });
            });
          });
        });
      });
    });
  });
};

// Criar o banco de dados
const createDatabase = async (dbInfo) => {
  const { username, password, host, port, dbName } = dbInfo;
  
  console.log(`\nCriando banco de dados '${dbName}'...`);
  
  try {
    // Definir variável de ambiente PGPASSWORD para autenticação
    process.env.PGPASSWORD = password;
    
    // Verificar se o banco de dados já existe
    try {
      execSync(`psql -U ${username} -h ${host} -p ${port} -d ${dbName} -c "SELECT 1;"`, { stdio: 'ignore' });
      console.log(`✅ Banco de dados '${dbName}' já existe`);
    } catch (error) {
      // Criar o banco de dados se não existir
      execSync(`psql -U ${username} -h ${host} -p ${port} -c "CREATE DATABASE ${dbName};"`);
      console.log(`✅ Banco de dados '${dbName}' criado com sucesso`);
    }
    
    // Atualizar o arquivo .env com as informações de conexão
    const envPath = path.join(__dirname, '..', '.env');
    const connectionString = `postgres://${username}:${password}@${host}:${port}/${dbName}`;
    
    let envContent;
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/DATABASE_URL=.*$/m, `DATABASE_URL=${connectionString}`);
    } catch (error) {
      envContent = `# Variáveis de ambiente para desenvolvimento local\nDATABASE_URL=${connectionString}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Arquivo .env atualizado com a string de conexão`);
    
    return connectionString;
  } catch (error) {
    console.error(`❌ Erro ao criar o banco de dados: ${error.message}`);
    process.exit(1);
  }
};

// Executar migrações do Drizzle
const runMigrations = (connectionString) => {
  console.log('\nExecutando migrações do banco de dados...');
  
  try {
    // Definir a variável de ambiente DATABASE_URL para o Drizzle
    process.env.DATABASE_URL = connectionString;
    
    // Executar o comando de migração do Drizzle
    execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
    console.log('✅ Migrações executadas com sucesso');
  } catch (error) {
    console.error(`❌ Erro ao executar migrações: ${error.message}`);
    console.log('   Você pode tentar executar manualmente: npx drizzle-kit push:pg');
  }
};

// Função principal
const main = async () => {
  try {
    const dbInfo = await askDatabaseInfo();
    const connectionString = await createDatabase(dbInfo);
    
    console.log('\nDeseja executar as migrações do banco de dados agora? (s/n)');
    rl.question('', (answer) => {
      if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
        runMigrations(connectionString);
      } else {
        console.log('\nVocê pode executar as migrações manualmente com o comando:');
        console.log('npx drizzle-kit push:pg');
      }
      
      console.log('\n✅ Configuração concluída!');
      console.log(`   String de conexão: ${connectionString}`);
      console.log('   Para iniciar o servidor, execute: npm run dev');
      rl.close();
    });
  } catch (error) {
    console.error(`❌ Erro durante a configuração: ${error.message}`);
    rl.close();
    process.exit(1);
  }
};

// Executar o script
main();