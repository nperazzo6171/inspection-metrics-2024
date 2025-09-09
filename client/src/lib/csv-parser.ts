import Papa from 'papaparse';

export interface CSVInspection {
  numero: string;
  unidadeInspecionada: string;
  departamento: string;
  coorpin: string;
  dataInspecao: string;
  delegadoCorregedor: string;
  naoConformidade: string;
  descricaoNaoConformidade: string;
  providenciasIniciais?: string;
  providenciasIntermediarias?: string;
  providenciasConclusivas?: string;
  dataInicioPrazo?: string;
  diasPrazo?: number;
  dataFimRegularizacao?: string;
  statusPrazo?: string;
  dataDeterminadaNovaInspecao?: string;
  criticidade?: string;
}

export const parseCSVData = (csvText: string): Promise<CSVInspection[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        const headerMap: { [key: string]: string } = {
          'Nº': 'numero',
          'Unidade Inspecionada': 'unidadeInspecionada',
          'Departamento': 'departamento',
          'COORPIN': 'coorpin',
          'Data da Inspeção': 'dataInspecao',
          'Delegado Corregedor Responsável': 'delegadoCorregedor',
          'Não Conformidade Identificada': 'naoConformidade',
          'Descrição da Não Conformidade Identificada': 'descricaoNaoConformidade',
          'Providências Iniciais': 'providenciasIniciais',
          'Providências Intermediárias': 'providenciasIntermediarias',
          'Providências Conclusivas': 'providenciasConclusivas',
          'Data Início Prazo Regularização': 'dataInicioPrazo',
          'Dias Prazo': 'diasPrazo',
          'Data Fim para Regularização': 'dataFimRegularizacao',
          'Status Prazo para Regularização': 'statusPrazo',
          'Data Determinada para Nova Inspeção': 'dataDeterminadaNovaInspecao',
          'Criticidade': 'criticidade'
        };
        return headerMap[header] || header;
      },
      transform: (value: string, field: string) => {
        // Handle date conversions and Excel serial dates
        if (field === 'dataInspecao' || field === 'dataInicioPrazo' || 
            field === 'dataFimRegularizacao' || field === 'dataDeterminadaNovaInspecao') {
          if (value && !isNaN(Number(value))) {
            // Convert Excel serial date to JavaScript Date
            const excelDate = new Date((Number(value) - 25569) * 86400 * 1000);
            return excelDate.toISOString().split('T')[0];
          }
          return value;
        }
        if (field === 'diasPrazo') {
          return value ? parseInt(value) : null;
        }
        return value || null;
      },
      complete: (results: any) => {
        const validData = results.data
          .filter((row: any) => row.numero && row.unidadeInspecionada)
          .map((row: any) => row as CSVInspection);
        resolve(validData);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

export const convertExcelDate = (serial: number): string => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
};
