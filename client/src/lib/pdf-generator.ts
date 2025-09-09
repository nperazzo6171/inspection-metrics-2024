import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFReport = (
  reportType: string, 
  data: any[], 
  summary?: any,
  filters?: any
) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Add Civil Police header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('POLÍCIA CIVIL DO ESTADO DA BAHIA', 105, 20, { align: 'center' });
  doc.text('ASTEC - CORREPOL', 105, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`Relatório Produzido pela ASTEC - CORREPOL`, 105, 45, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Data de Geração: ${currentDate}`, 20, 60);
  
  if (filters && Object.keys(filters).length > 0) {
    doc.text('Filtros Aplicados:', 20, 70);
    let yPos = 75;
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        doc.text(`${key}: ${value}`, 25, yPos);
        yPos += 5;
      }
    });
  }

  let startY = filters && Object.keys(filters).length > 0 ? 95 : 80;

  switch (reportType) {
    case 'dashboard':
      generateDashboardReport(doc, data, summary, startY);
      break;
    case 'deadlines':
      generateDeadlinesReport(doc, data, startY);
      break;
    case 'normalization':
      generateNormalizationReport(doc, data, summary, startY);
      break;
    case 'unidade':
      generateUnidadeSection(doc, data, summary, startY);
      break;
    case 'nao-conformidade':
      generateNaoConformidadeReport(doc, data, startY, filters);
      break;
    default:
      generateDashboardReport(doc, data, summary, startY);
  }

  // Save the PDF
  const fileName = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

const generateDashboardReport = (doc: jsPDF, data: any[], summary: any, startY: number) => {
  // Summary section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO EXECUTIVO', 20, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Calculate statistics from data
  const inspectionGroups = new Map();
  data.forEach(item => {
    const key = `${item.delegadoCorregedor}-${item.dataInspecao}`;
    if (!inspectionGroups.has(key)) {
      inspectionGroups.set(key, []);
    }
    inspectionGroups.get(key).push(item);
  });
  const uniqueInspections = inspectionGroups.size;
  const totalNonConformities = data.length;
  const withinDeadline = data.filter(item => item.statusPrazo === 'Dentro do prazo').length;
  const nearDeadline = data.filter(item => item.statusPrazo === 'Próximo do vencimento').length;
  const overdue = data.filter(item => item.statusPrazo === 'Prazo expirado').length;
  const regularized = data.filter(item => item.providenciasConclusivas === 'Regularizado').length;
  const pending = data.filter(item => item.providenciasConclusivas === 'Pendente').length;
  
  const summaryText = [
    `Total de Inspeções: ${uniqueInspections}`,
    `Total de Não Conformidades: ${totalNonConformities}`,
    `Dentro do Prazo: ${withinDeadline}`,
    `Próximo do Vencimento: ${nearDeadline}`,
    `Prazo Expirado: ${overdue}`,
    `Regularizadas: ${regularized}`,
    `Pendentes: ${pending}`
  ];
  
  summaryText.forEach((text, index) => {
    doc.text(text, 20, startY + 15 + (index * 7));
  });

  // Table with ALL inspection data - not limited
  const tableData = data.map(item => [
    item.unidadeInspecionada || 'N/A',
    item.departamento || 'N/A',
    item.dataInspecao ? new Date(item.dataInspecao).toLocaleDateString('pt-BR') : 'N/A',
    item.naoConformidade || 'N/A',
    item.descricaoNaoConformidade || 'N/A',
    item.statusPrazo || 'N/A'
  ]);

  autoTable(doc, {
    head: [['Unidade', 'Departamento', 'Data Inspeção', 'Não Conformidade', 'Descrição da Não Conformidade Identificada', 'Status']],
    body: tableData,
    startY: startY + 75,
    styles: { 
      fontSize: 7, 
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Unidade
      1: { cellWidth: 15 }, // Departamento
      2: { cellWidth: 15 }, // Data
      3: { cellWidth: 30 }, // Não Conformidade
      4: { cellWidth: 45 }, // Descrição da Não Conformidade Identificada
      5: { cellWidth: 15 }  // Status
    }
  });
};

const generateDeadlinesReport = (doc: jsPDF, data: any[], startY: number) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE PRAZOS DE REGULARIZAÇÃO', 20, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const inspectionGroups = new Map();
  data.forEach(item => {
    const key = `${item.delegadoCorregedor}-${item.dataInspecao}`;
    if (!inspectionGroups.has(key)) {
      inspectionGroups.set(key, []);
    }
    inspectionGroups.get(key).push(item);
  });
  const uniqueInspections = inspectionGroups.size;
  const totalNonConformities = data.length;
  const withDeadline = data.filter(item => item.dataFimRegularizacao).length;
  
  doc.text(`Total de Inspeções: ${uniqueInspections}`, 20, startY + 15);
  doc.text(`Total de Não Conformidades: ${totalNonConformities}`, 20, startY + 25);
  doc.text(`Com Prazo Definido: ${withDeadline}`, 20, startY + 35);
  
  const tableData = data.map(item => {
    let diasRestantes = 'N/A';
    if (item.dataFimRegularizacao) {
      const endDate = new Date(item.dataFimRegularizacao);
      const currentDate = new Date();
      const diffTime = endDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        diasRestantes = `${diffDays} dias restantes`;
      } else {
        diasRestantes = `${Math.abs(diffDays)} dias em atraso`;
      }
    }
    
    return [
      item.unidadeInspecionada || 'N/A',
      item.departamento || 'N/A',
      item.naoConformidade || 'N/A',
      item.descricaoNaoConformidade || 'N/A',
      item.dataFimRegularizacao ? new Date(item.dataFimRegularizacao).toLocaleDateString('pt-BR') : 'N/A',
      diasRestantes,
      item.statusPrazo || 'N/A',
      item.providenciasConclusivas || 'N/A'
    ];
  });

  autoTable(doc, {
    head: [['Unidade', 'Departamento', 'Não Conformidade', 'Descrição da Não Conformidade Identificada', 'Data Limite', 'Situação Prazo', 'Status', 'Providências']],
    body: tableData,
    startY: startY + 50,
    styles: { 
      fontSize: 6, 
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Unidade
      1: { cellWidth: 12 }, // Departamento
      2: { cellWidth: 25 }, // Não Conformidade
      3: { cellWidth: 35 }, // Descrição da Não Conformidade Identificada
      4: { cellWidth: 15 }, // Data Limite
      5: { cellWidth: 18 }, // Situação Prazo
      6: { cellWidth: 12 }, // Status
      7: { cellWidth: 20 }  // Providências
    }
  });
};

const generateNormalizationReport = (doc: jsPDF, data: any[], summary: any, startY: number) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE NORMALIZAÇÃO', 20, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const inspectionGroups = new Map();
  data.forEach(item => {
    const key = `${item.delegadoCorregedor}-${item.dataInspecao}`;
    if (!inspectionGroups.has(key)) {
      inspectionGroups.set(key, []);
    }
    inspectionGroups.get(key).push(item);
  });
  const uniqueInspections = inspectionGroups.size;
  const totalNonConformities = data.length;
  
  doc.text(`Total de Inspeções: ${uniqueInspections}`, 20, startY + 15);
  doc.text(`Total de Não Conformidades: ${totalNonConformities}`, 20, startY + 25);
  doc.text(`Tipos de Não Conformidades: ${summary?.nonComplianceData?.length || 0}`, 20, startY + 35);

  if (summary?.nonComplianceData) {
    const tableData = summary.nonComplianceData.map((item: any) => [
      item.name,
      item.value.toString(),
      `${((item.value / data.length) * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
      head: [['Tipo de Não Conformidade', 'Quantidade', 'Percentual']],
      body: tableData,
      startY: startY + 50,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] }
    });
  }
};

const generateUnidadeSection = (doc: jsPDF, data: any[], summary: any, startY: number) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DETALHADO POR UNIDADE', 20, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Calculate distinct inspections (unique delegado + data combinations) and total non-conformities
  const inspectionGroups = new Map();
  data.forEach(item => {
    const key = `${item.delegadoCorregedor}-${item.dataInspecao}`;
    if (!inspectionGroups.has(key)) {
      inspectionGroups.set(key, []);
    }
    inspectionGroups.get(key).push(item);
  });
  const uniqueInspections = inspectionGroups.size;
  const totalNonConformities = data.length;
  
  doc.text(`Total de Inspeções: ${uniqueInspections}`, 20, startY + 15);
  doc.text(`Total de Não Conformidades: ${totalNonConformities}`, 20, startY + 25);

  // Table with ALL inspection data - complete information
  const tableData = data.map(item => [
    item.unidadeInspecionada || 'N/A',
    item.departamento || 'N/A',
    item.dataInspecao ? new Date(item.dataInspecao).toLocaleDateString('pt-BR') : 'N/A',
    item.delegadoCorregedor || 'N/A',
    item.naoConformidade || 'N/A',
    item.descricaoNaoConformidade || 'N/A',
    item.providenciasConclusivas || 'Pendente',
    item.dataFimRegularizacao ? new Date(item.dataFimRegularizacao).toLocaleDateString('pt-BR') : 'N/A'
  ]);

  autoTable(doc, {
    head: [['Unidade', 'Departamento', 'Data da Inspeção', 'Delegado Corregedor', 'Não Conformidades', 'Descrição da Não Conformidade Identificada', 'Providências para Regularização', 'Prazo para Regularização']],
    body: tableData,
    startY: startY + 40,
    styles: { 
      fontSize: 6, 
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Unidade
      1: { cellWidth: 12 }, // Departamento
      2: { cellWidth: 15 }, // Data
      3: { cellWidth: 20 }, // Corregedor
      4: { cellWidth: 25 }, // Não Conformidade
      5: { cellWidth: 35 }, // Descrição da Não Conformidade Identificada
      6: { cellWidth: 25 }, // Providências
      7: { cellWidth: 15 }  // Prazo
    }
  });
};

const generateNaoConformidadeReport = (doc: jsPDF, data: any[], startY: number, filters?: any) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const naoConformidadeFiltro = filters?.naoConformidade || 'Todas as não conformidades';
  doc.text(`RELATÓRIO DE NÃO CONFORMIDADE: ${naoConformidadeFiltro.toUpperCase()}`, 20, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Group data by unit
  const unidadeMap = new Map();
  data.forEach(item => {
    const unidade = item.unidadeInspecionada;
    if (!unidadeMap.has(unidade)) {
      unidadeMap.set(unidade, []);
    }
    unidadeMap.get(unidade).push(item);
  });
  
  doc.text(`Total de Unidades Afetadas: ${unidadeMap.size}`, 20, startY + 15);
  doc.text(`Total de Registros de Não Conformidade: ${data.length}`, 20, startY + 25);
  
  // Create table with detailed information
  const tableData = data.map(item => [
    item.unidadeInspecionada || 'N/A',
    item.departamento || 'N/A', 
    item.naoConformidade || 'N/A',
    item.descricaoNaoConformidade || 'N/A',
    item.dataInspecao ? new Date(item.dataInspecao).toLocaleDateString('pt-BR') : 'N/A',
    item.delegadoCorregedor || 'N/A',
    item.statusPrazo || 'N/A',
    item.dataFimRegularizacao ? new Date(item.dataFimRegularizacao).toLocaleDateString('pt-BR') : 'Não definida'
  ]);

  autoTable(doc, {
    head: [['Unidade Policial', 'Departamento', 'Não Conformidade', 'Descrição da Não Conformidade', 'Data da Inspeção', 'Delegado Corregedor', 'Status do Prazo', 'Data Fim Regularização']],
    body: tableData,
    startY: startY + 40,
    styles: { 
      fontSize: 6, 
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: { 
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Unidade
      1: { cellWidth: 15 }, // Departamento
      2: { cellWidth: 25 }, // Não Conformidade
      3: { cellWidth: 40 }, // Descrição
      4: { cellWidth: 15 }, // Data Inspeção
      5: { cellWidth: 20 }, // Delegado
      6: { cellWidth: 15 }, // Status
      7: { cellWidth: 15 }  // Data Fim
    }
  });
};
