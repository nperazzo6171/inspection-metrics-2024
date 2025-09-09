import XLSX from 'xlsx';
import fs from 'fs';

// Função para converter data serial do Excel para Date
function excelDateToJSDate(excelDate) {
  if (!excelDate || typeof excelDate !== 'number') return null;
  
  // Excel date serial: dias desde 1900-01-01 (com correção para bug do Excel)
  const excelEpoch = new Date(1900, 0, 1);
  const jsDate = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
  return jsDate.toISOString().split('T')[0]; // formato YYYY-MM-DD
}

// Função para extrair ano da data
function getYearFromDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString).getFullYear();
}

// Função para corrigir classificação de departamentos
function corrigirDepartamento(departamento, unidade) {
  // DRFR e DRFRV são delegacias especializadas, não departamentos
  // Devem ser reclassificadas para DEIC (Departamento Especializado de Investigações Criminais)
  if (departamento === 'DRFR' || departamento === 'DRFRV') {
    return 'DEIC';
  }
  return departamento;
}

// Função para processar os dados das planilhas
function processExcelData() {
  console.log('Importando dados das planilhas Excel...\n');
  
  // Usar arquivo mais recente disponível no sistema
  const workbook1 = XLSX.readFile('attached_assets/CONCLUSIVA 2 - PRAZO_1753189803746.xlsx');
  const worksheet1 = workbook1.Sheets['Gestão Inspeções'];
  const data1 = XLSX.utils.sheet_to_json(worksheet1, { header: 1 });
  
  // Planilha sem prazos
  const workbook2 = XLSX.readFile('attached_assets/CONCLUSIVA_1753189803747.xlsx');
  const worksheet2 = workbook2.Sheets['Gestão Inspeções'];
  const data2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });
  
  console.log(`Planilha 1 (com prazos): ${data1.length - 1} registros`);
  console.log(`Planilha 2 (sem prazos): ${data2.length - 1} registros`);
  
  const inspections = [];
  
  // Processar primeira planilha (com prazos) - TODOS os dados
  for (let i = 1; i < data1.length; i++) {
    const row = data1[i];
    if (!row || row.length < 10) continue;
    
    const inspection = {
      id: inspections.length + 1,
      numero: String(row[0] || i).padStart(3, '0'),
      unidadeInspecionada: row[1] || 'N/A',
      departamento: corrigirDepartamento(row[2] || 'N/A', row[1] || 'N/A'),
      coorpin: row[3] || 'N/A',
      dataInspecao: excelDateToJSDate(row[4]),
      delegadoCorregedor: row[5] || 'N/A',
      naoConformidade: row[6] || 'N/A',
      descricaoNaoConformidade: row[7] || 'N/A',
      providenciasIniciais: row[8] || 'Pendente',
      providenciasIntermediarias: row[8] || 'Pendente',
      providenciasConclusivas: row[8] || 'Pendente',
      dataInicioRegularizacao: excelDateToJSDate(row[9]),
      diasPrazo: row[10] || 0,
      dataFimRegularizacao: excelDateToJSDate(row[11]),
      statusPrazo: row[12] || 'Pendente',
      dataNovaInspecao: excelDateToJSDate(row[13]),
      criticidade: row[14] || 'Média'
    };
    
    inspections.push(inspection);
  }
  
  // Processar segunda planilha (sem prazos) - TODOS os dados
  for (let i = 1; i < data2.length; i++) {
    const row = data2[i];
    if (!row || row.length < 8) continue;
    
    const inspection = {
      id: inspections.length + 1,
      numero: String(row[0] || inspections.length + 1).padStart(3, '0'),
      unidadeInspecionada: row[1] || 'N/A',
      departamento: corrigirDepartamento(row[2] || 'N/A', row[1] || 'N/A'),
      coorpin: row[3] || 'N/A',
      dataInspecao: excelDateToJSDate(row[4]),
      delegadoCorregedor: row[5] || 'N/A',
      naoConformidade: row[6] || 'N/A',
      descricaoNaoConformidade: row[7] || 'N/A',
      providenciasIniciais: row[8] || 'Pendente',
      providenciasIntermediarias: row[8] || 'Pendente',
      providenciasConclusivas: row[8] || 'Pendente',
      dataInicioRegularizacao: null,
      diasPrazo: 0,
      dataFimRegularizacao: null,
      statusPrazo: 'Pendente',
      dataNovaInspecao: null,
      criticidade: row[9] || 'Média'
    };
    
    inspections.push(inspection);
  }
  
  console.log(`\nTotal de inspeções processadas: ${inspections.length}`);
  
  // Salvar dados em formato JSON
  fs.writeFileSync('data/real-inspections.json', JSON.stringify(inspections, null, 2));
  console.log('Dados salvos em: data/real-inspections.json');
  
  // Mostrar estatísticas
  const departments = [...new Set(inspections.map(i => i.departamento))];
  const criticidades = inspections.reduce((acc, i) => {
    acc[i.criticidade] = (acc[i.criticidade] || 0) + 1;
    return acc;
  }, {});
  
  // Estatísticas por ano
  const anoStats = inspections.reduce((acc, i) => {
    const ano = getYearFromDate(i.dataInspecao);
    if (ano) {
      acc[ano] = (acc[ano] || 0) + 1;
    }
    return acc;
  }, {});
  
  console.log(`\nDepartamentos encontrados: ${departments.length}`);
  console.log(`Departamentos: ${departments.join(', ')}`);
  console.log('\nCriticidades:');
  Object.entries(criticidades).forEach(([key, value]) => {
    console.log(`  ${key}: ${value} inspeções`);
  });
  console.log('\nInspeções por Ano:');
  Object.entries(anoStats).sort().forEach(([ano, count]) => {
    console.log(`  ${ano}: ${count} inspeções`);
  });
  
  return inspections;
}

// Executar importação
try {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }
  
  const inspections = processExcelData();
  console.log('\n✅ Importação concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro durante a importação:', error.message);
}