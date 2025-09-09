import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { FileText, Filter, Download, AlertTriangle, Clock, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, BarChart3, PieChart as PieChartIcon, Activity, Target, Zap, Users } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-generator";
import * as XLSX from 'xlsx';

interface ReportsProps {
  data: any[];
  reportData?: any;
  filters?: any;
  onFilterChange?: (filters: any) => void;
}

export default function Reports({ data, reportData, filters = {}, onFilterChange }: ReportsProps) {
  const [reportFilters, setReportFilters] = useState({
    reportType: 'non-compliance',
    dateRange: 'all',
    department: 'all',
    status: 'all',
    criticality: 'all'
  });

  // Apply filter when department changes
  const handleDepartmentChange = (department: string) => {
    setReportFilters(prev => ({ ...prev, department }));
    if (onFilterChange) {
      const newFilters = department === 'all' ? {} : { departamento: [department] };
      onFilterChange(newFilters);
    }
  };

  // Apply filter when status changes
  const handleStatusChange = (status: string) => {
    setReportFilters(prev => ({ ...prev, status }));
    if (onFilterChange) {
      let filterValue = status;
      if (status === 'sem_status') {
        filterValue = ''; // Convert to empty string for database query
      }
      const newFilters = status === 'all' ? {} : { statusPrazo: filterValue };
      onFilterChange(newFilters);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredData.map(item => ({
        'Número': item.numero,
        'Unidade Inspecionada': item.unidadeInspecionada,
        'Departamento': item.departamento,
        'COORPIN': item.coorpin,
        'Data Inspeção': new Date(item.dataInspecao).toLocaleDateString('pt-BR'),
        'Não Conformidade': item.naoConformidade,
        'Criticidade': item.criticidade,
        'Status': item.statusPrazo || 'N/A',
        'Observações': item.observacoes || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-fit columns
      const colWidths = [
        { wch: 10 },  // Número
        { wch: 30 },  // Unidade Inspecionada
        { wch: 15 },  // Departamento
        { wch: 15 },  // COORPIN
        { wch: 12 },  // Data Inspeção
        { wch: 40 },  // Não Conformidade
        { wch: 12 },  // Criticidade
        { wch: 12 },  // Status
        { wch: 30 }   // Observações
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Inspeções');

      // Generate filename with current date
      const now = new Date();
      const filename = `relatorio-inspecoes-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      console.log('Excel exportado com sucesso:', filename);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    }
  };

  const COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)', 'hsl(280, 100%, 70%)'];

  // Filter data based on current filters
  const filteredData = data.filter(item => {
    if (reportFilters.department !== 'all' && item.departamento !== reportFilters.department) return false;
    if (reportFilters.status !== 'all' && item.statusPrazo !== reportFilters.status) return false;
    if (reportFilters.criticality !== 'all' && item.criticidade !== reportFilters.criticality) return false;
    
    if (reportFilters.dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      const itemDate = new Date(item.dataInspecao);
      const startDate = new Date(customDateRange.startDate);
      const endDate = new Date(customDateRange.endDate);
      if (itemDate < startDate || itemDate > endDate) return false;
    }
    
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset pagination when filters change
  const handleFilterChange = (key: string, value: string) => {
    setReportFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Generate statistics for filtered data - Count unique inspections vs total non-conformities
  const uniqueInspections = new Set();
  filteredData.forEach(item => {
    const key = `${item.unidadeInspecionada}-${item.dataInspecao}`;
    uniqueInspections.add(key);
  });

  // Use reportData summary if available (from backend API with proper filtering)
  const statistics = reportData?.summary ? {
    total: reportData.summary.totalInspections,
    nonCompliances: reportData.summary.totalNonCompliances,
    withinDeadline: reportData.summary.withinDeadline,
    nearDeadline: reportData.summary.nearDeadline,
    overdue: reportData.summary.overdue,
    // CORRIGIDO: Usar dados reais do Status de Regularização
    regularized: reportData.summary.regularizados || 0,
    pending: reportData.summary.pendentes || 0,
    naoRegularizados: reportData.summary.naoRegularizados || 0,
    totalControlePrazos: reportData.summary.totalControlePrazos || 0
  } : {
    total: uniqueInspections.size, // Unique inspections by unit/date  
    nonCompliances: filteredData.length, // Total non-conformities
    withinDeadline: filteredData.filter(item => item.statusPrazo === 'Dentro do prazo').length,
    nearDeadline: filteredData.filter(item => item.statusPrazo === 'Próximo do vencimento').length,
    overdue: filteredData.filter(item => item.statusPrazo === 'Prazo expirado').length,
    regularized: 0, // Fallback quando não há reportData
    pending: 0,
    naoRegularizados: 0,
    totalControlePrazos: 0
  };

  // Chart data - Count unique inspections by department like in dashboard-general
  const departmentChart = reportData?.charts?.departmentData || filteredData.reduce((acc: any[], item) => {
    const key = `${item.unidadeInspecionada}-${item.dataInspecao}-${item.delegadoCorregedor}`;
    const dept = acc.find(d => d.name === item.departamento);
    if (dept) {
      if (!dept.uniqueInspections) dept.uniqueInspections = new Set();
      if (!dept.uniqueInspections.has(key)) {
        dept.uniqueInspections.add(key);
        dept.value += 1; // Count unique inspections only
      }
    } else {
      const uniqueInspections = new Set([key]);
      acc.push({ name: item.departamento, value: 1, uniqueInspections });
    }
    return acc;
  }, []).map((item: any) => ({ name: item.name, value: item.value }));

  const nonComplianceChart = filteredData.reduce((acc: any[], item) => {
    const nc = acc.find(n => n.name === item.naoConformidade);
    if (nc) {
      nc.value += 1;
    } else {
      acc.push({ name: item.naoConformidade, value: 1 });
    }
    return acc;
  }, []);

  const statusChart = filteredData.reduce((acc: any[], item) => {
    // Define status padrão se não existir ou for null/undefined
    const statusName = item.statusPrazo || 'Não informado';
    const status = acc.find(s => s.name === statusName);
    if (status) {
      status.value += 1;
    } else {
      acc.push({ name: statusName, value: 1 });
    }
    return acc;
  }, []);

  const criticalityChart = filteredData.reduce((acc: any[], item) => {
    const crit = acc.find(c => c.name === item.criticidade);
    if (crit) {
      crit.value += 1;
    } else {
      acc.push({ name: item.criticidade, value: 1 });
    }
    return acc;
  }, []);

  const handleGenerateReport = (reportType: string) => {
    const reportData = {
      summary: statistics,
      charts: {
        departmentData: departmentChart,
        nonComplianceData: nonComplianceChart,
        statusData: statusChart,
        criticalityData: criticalityChart
      }
    };
    
    // Clean filters to show only user-relevant information
    const cleanFilters: any = {};
    if (reportFilters.department && reportFilters.department !== 'all') {
      cleanFilters['Departamento'] = reportFilters.department;
    }
    if (reportFilters.dateRange && reportFilters.dateRange !== 'all') {
      if (reportFilters.dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
        cleanFilters['Período'] = `${customDateRange.startDate} até ${customDateRange.endDate}`;
      } else {
        cleanFilters['Período'] = reportFilters.dateRange === 'last30' ? 'Últimos 30 dias' : 
                                 reportFilters.dateRange === 'last90' ? 'Últimos 90 dias' : 
                                 'Período personalizado';
      }
    }
    if (reportFilters.status && reportFilters.status !== 'all') {
      cleanFilters['Status'] = reportFilters.status;
    }
    if (reportFilters.criticality && reportFilters.criticality !== 'all') {
      cleanFilters['Criticidade'] = reportFilters.criticality;
    }
    
    generatePDFReport(reportType, filteredData, reportData, cleanFilters);
  };

  const uniqueDepartments = Array.from(new Set(data.map(item => item.departamento)));

  return (
    <div className="space-y-6">
      {/* Modern Filters Section */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-purple-800">
            <Filter className="w-6 h-6 mr-3" />
            Central de Filtros e Relatórios
          </CardTitle>
          <p className="text-sm text-purple-600 mt-1">Configure os parâmetros e gere relatórios personalizados</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select 
                value={reportFilters.reportType}
                onValueChange={(value) => setReportFilters({...reportFilters, reportType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="non-compliance">Não Conformidades</SelectItem>
                  <SelectItem value="deadlines">Prazos</SelectItem>
                  <SelectItem value="status">Status Geral</SelectItem>
                  <SelectItem value="department">Por Departamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <Select 
                value={reportFilters.dateRange}
                onValueChange={(value) => setReportFilters({...reportFilters, dateRange: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="last-30">Últimos 30 dias</SelectItem>
                  <SelectItem value="last-90">Últimos 90 dias</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Departamento</Label>
              <Select 
                value={reportFilters.department}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status do Prazo</Label>
              <Select 
                value={reportFilters.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Dentro do prazo">Dentro do prazo</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="sem_status">Sem status definido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Criticidade</Label>
              <Select 
                value={reportFilters.criticality}
                onValueChange={(value) => setReportFilters({...reportFilters, criticality: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as criticidades</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportFilters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Data Inicial</Label>
                <Input 
                  type="date" 
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Data Final</Label>
                <Input 
                  type="date" 
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={() => handleGenerateReport(reportFilters.reportType)} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Gerar Relatório PDF
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              size="lg"
              onClick={exportToExcel}
            >
              <Target className="w-5 h-5 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modern Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Main KPIs */}
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Indicadores Principais</h3>
                <p className="text-gray-600 mt-1">Visão geral dos dados de inspeção</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{statistics.total}</p>
                    <p className="text-gray-600 text-sm">Total de Inspeções</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{statistics.nonCompliances}</p>
                    <p className="text-gray-600 text-sm">Não Conformidades</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Status de Regularização */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-orange-800">
              <Activity className="w-6 h-6 mr-3" />
              Status de Regularização
            </CardTitle>
            <p className="text-sm text-orange-600">Dados vinculados ao controle de prazos</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-orange-700">{statistics.totalControlePrazos}</p>
              <p className="text-sm text-orange-600">Total de Registros de Controle</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-green-100 rounded-lg border border-green-200">
                <div className="p-2 bg-green-500 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-700">{statistics.regularized}</p>
                <p className="text-xs text-green-600 font-medium">Regularizadas</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-200">
                <div className="p-2 bg-yellow-500 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-yellow-700">{statistics.pending}</p>
                <p className="text-xs text-yellow-600 font-medium">Pendentes</p>
              </div>
              
              <div className="text-center p-4 bg-red-100 rounded-lg border border-red-200">
                <div className="p-2 bg-red-500 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-red-700">{statistics.naoRegularizados}</p>
                <p className="text-xs text-red-600 font-medium">Não Regular.</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="mt-6 p-4 bg-white rounded-lg border">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-700">Taxa de Regularização</span>
                <span className="text-orange-600">
                  {statistics.totalControlePrazos > 0 ? ((statistics.regularized / statistics.totalControlePrazos) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: statistics.totalControlePrazos > 0 ? `${(statistics.regularized / statistics.totalControlePrazos) * 100}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Non-Compliance Chart */}
        <Card className="lg:col-span-2 border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-indigo-600" />
                  Análise de Não Conformidades
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Distribuição por categoria de irregularidade</p>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700">{nonComplianceChart.length} tipos</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={nonComplianceChart.slice(0, 15)} margin={{ top: 30, left: 20, right: 20, bottom: 80 }}>
                <defs>
                  <linearGradient id="nonComplianceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  fontSize={9} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  stroke="#6b7280"
                />
                <YAxis fontSize={12} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#nonComplianceGradient)"
                  radius={[4, 4, 0, 0]}
                >
                  {nonComplianceChart.slice(0, 15).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#nonComplianceGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Modern Status Chart */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-emerald-600" />
              Status dos Prazos
            </CardTitle>
            <p className="text-sm text-gray-500">Situação atual das cobranças</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Gráfico à esquerda */}
              <div className="flex-shrink-0">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={statusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChart.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value} registros`, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legenda à direita */}
              <div className="flex-1 space-y-3">
                {statusChart.map((entry: any, index: number) => {
                  const total = statusChart.reduce((acc: number, item: any) => acc + item.value, 0);
                  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-gray-700 text-sm">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{entry.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-amber-600" />
              Distribuição por Departamento
            </CardTitle>
            <p className="text-sm text-gray-500">Volume de inspeções por órgão</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentChart} margin={{ bottom: 50 }}>
                <defs>
                  <linearGradient id="deptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  angle={-45} 
                  textAnchor="end" 
                  height={50}
                  stroke="#6b7280"
                />
                <YAxis fontSize={12} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#deptGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Criticality Analysis */}
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-rose-600" />
              Análise de Criticidade
            </CardTitle>
            <p className="text-sm text-gray-500">Classificação por nível de urgência</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={criticalityChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  fontSize={12}
                >
                  {criticalityChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Data Table */}
      <Card className="border-l-4 border-l-cyan-500">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-cyan-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-800">Detalhamento das Inspeções</h3>
                <p className="text-sm text-gray-500">Análise completa dos registros filtrados</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Página {currentPage} de {totalPages} 
              <span className="text-xs">({startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Não Conformidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criticidade</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numero}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.unidadeInspecionada}>
                      {item.unidadeInspecionada}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.departamento}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.dataInspecao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={item.naoConformidade}>
                      {item.naoConformidade}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          item.statusPrazo === 'Dentro do prazo' ? 'default' :
                          item.statusPrazo === 'Próximo do vencimento' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {item.statusPrazo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          item.criticidade === 'Alta' ? 'destructive' :
                          item.criticidade === 'Média' ? 'secondary' :
                          'default'
                        }
                      >
                        {item.criticidade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          item.providenciasConclusivas === 'Regularizado' ? 'default' :
                          item.providenciasConclusivas === 'Pendente' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {item.providenciasConclusivas}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma inspeção encontrada para os filtros selecionados.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}