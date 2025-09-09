import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Função para processar planilhas Excel
function processExcelFile(filePath) {
  console.log(`Processando: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    console.log(`Planilhas encontradas: ${sheetNames.join(', ')}`);
    
    const results = {};
    
    sheetNames.forEach(sheetName => {
      console.log(`\nProcessando planilha: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`Linhas encontradas: ${data.length}`);
      if (data.length > 0) {
        console.log(`Cabeçalhos: ${JSON.stringify(data[0])}`);
        
        // Mostrar algumas linhas de exemplo
        for (let i = 1; i < Math.min(4, data.length); i++) {
          console.log(`Linha ${i}: ${JSON.stringify(data[i])}`);
        }
      }
      
      results[sheetName] = data;
    });
    
    return results;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return null;
  }
}

// Processar ambas as planilhas
const files = [
  'attached_assets/CONCLUSIVA 2 - PRAZO_1753193607601.xlsx',
  'attached_assets/CONCLUSIVA_1753193607602.xlsx'
];

console.log('=== ANÁLISE DAS PLANILHAS EXCEL ===\n');

files.forEach(file => {
  if (fs.existsSync(file)) {
    const results = processExcelFile(file);
    if (results) {
      console.log(`\n--- RESUMO: ${path.basename(file)} ---`);
      Object.keys(results).forEach(sheet => {
        console.log(`Planilha "${sheet}": ${results[sheet].length} linhas`);
      });
    }
  } else {
    console.log(`Arquivo não encontrado: ${file}`);
  }
});