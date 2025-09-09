import XLSX from 'xlsx';
import fs from 'fs';

function convertExcelDate(serialDate) {
  if (!serialDate || typeof serialDate !== 'number') return null;
  
  // Excel serial date conversion (Excel counts from 1900-01-01, but has a bug with 1900 being a leap year)
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const jsDate = new Date(excelEpoch.getTime() + serialDate * 24 * 60 * 60 * 1000);
  
  // Return in ISO format for database compatibility
  return jsDate.toISOString().split('T')[0];
}

function processExcelFile(filePath, sheetName) {
  console.log(`Processando arquivo: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      console.log(`Sheet "${sheetName}" não encontrada no arquivo ${filePath}`);
      console.log('Sheets disponíveis:', Object.keys(workbook.Sheets));
      return [];
    }
    
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`${data.length} registros encontrados em ${filePath}`);
    
    return data.map((row, index) => {
      // Generate unique ID starting from a high number to avoid conflicts
      const baseId = filePath.includes('CONCLUSIVA 2') ? 30000 : 20000;
      
      // Process dates properly
      const dataInspecao = convertExcelDate(row['Data da Inspeção'] || row['Data']);
      const dataFim = convertExcelDate(row['Data Fim da Regularização'] || row['Data Limite'] || row['Prazo']);
      
      // Calculate status based on deadline dates
      function calculateStatus(dataFim) {
        if (!dataFim) return 'Sem prazo definido';
        
        const today = new Date();
        const deadline = new Date(dataFim);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Prazo expirado';
        if (diffDays <= 7) return 'Próximo do vencimento';
        return 'Dentro do prazo';
      }
      
      const statusPrazo = row['Status Prazo para Regularização'] || 
                         row['Status do Prazo'] || 
                         row['Status'] || 
                         (dataFim ? calculateStatus(dataFim) : 'Sem prazo estabelecido');
      
      return {
        id: baseId + index + 1,
        numero: row['Nº da Inspeção'] || row['Numero'] || (index + 1).toString().padStart(3, '0'),
        unidadeInspecionada: row['Unidade Inspecionada'] || row['Unidade'] || 'N/A',
        departamento: row['Departamento'] || 'N/A',
        dataInspecao: dataInspecao,
        delegadoCorregedor: row['Delegado Corregedor Responsável'] || row['Delegado Corregedor'] || row['Corregedor'] || 'N/A',
        naoConformidade: row['Não Conformidade Identificada'] || row['Não Conformidade'] || row['Nao Conformidade'] || 'Não conformidade geral',
        descricaoNaoConformidade: row['Descrição da Não Conformidade Identificada'] || 
                                  row['Descrição da Não Conformidade'] ||
                                  row['Descrição'] || 
                                  row['Descricao'] || 
                                  row['Descricao da Nao Conformidade'] ||
                                  row['Descrição da Não Conformidade Identificada'] ||
                                  'Descrição não disponível',
        providenciasConclusivas: row['Providências (Iniciais, Intermediárias, Conclusivas)'] ||
                                row['Providências Conclusivas'] || 
                                row['Providencias'] || 
                                'Pendente',
        dataFimRegularizacao: dataFim,
        statusPrazo: statusPrazo,
        criticidade: row['Criticidade'] || 'Média',
        coorpin: row['COORPIN'] || 'N/A'
      };
    });
    
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return [];
  }
}

async function processAllFiles() {
  const files = [
    {
      path: '../attached_assets/CONCLUSIVA 2 - PRAZO_1753225500658.xlsx',
      sheet: 'Gestão Inspeções'
    }
  ];
  
  let allInspections = [];
  
  for (const file of files) {
    const data = processExcelFile(file.path, file.sheet);
    allInspections.push(...data);
  }
  
  // Process data as-is from the spreadsheet
  // Each row represents a real non-conformity from the inspection
  const uniqueInspections = allInspections;
  
  const uniqueInspectionKeys = new Set();
  allInspections.forEach(inspection => {
    const key = `${inspection.unidadeInspecionada}-${inspection.dataInspecao}`;
    uniqueInspectionKeys.add(key);
  });
  
  console.log(`\nTotal de inspeções únicas: ${uniqueInspectionKeys.size}`);
  console.log(`Total de não conformidades: ${uniqueInspections.length}`);
  
  // Save to JSON file
  fs.writeFileSync('../data/real-inspections.json', JSON.stringify(uniqueInspections, null, 2));
  console.log('Dados salvos em data/real-inspections.json');
  
  // Print unit statistics
  const units = [...new Set(uniqueInspections.map(i => i.unidadeInspecionada))].sort();
  console.log(`\nTotal de unidades distintas: ${units.length}`);
  
  // Print status distribution
  const statusCounts = {};
  uniqueInspections.forEach(item => {
    statusCounts[item.statusPrazo] = (statusCounts[item.statusPrazo] || 0) + 1;
  });
  console.log('\nDistribuição de status:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`- ${status}: ${count}`);
  });
  
  return uniqueInspections;
}

processAllFiles();