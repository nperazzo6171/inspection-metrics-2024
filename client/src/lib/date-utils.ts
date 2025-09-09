export const calculateRemainingDays = (endDateString: string): number => {
  if (!endDateString) return 0;
  
  const endDate = new Date(endDateString);
  const currentDate = new Date(); // Use current date instead of fixed date
  
  // Zero out the time for date-only comparison
  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  const diffTime = endDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const formatDateToBR = (dateString: string): string => {
  if (!dateString) return 'Não definida';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const convertExcelSerialDate = (serial: number): string => {
  // Excel stores dates as number of days since January 1, 1900
  // JavaScript Date epoch is January 1, 1970
  // There's a 25569 day difference between these epochs
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  
  return date_info.toISOString().split('T')[0];
};

export const getStatusFromDays = (remainingDays: number): string => {
  if (remainingDays > 7) {
    return 'Dentro do prazo';
  } else if (remainingDays > 0) {
    return 'Próximo do vencimento';
  } else {
    return 'Prazo expirado';
  }
};
