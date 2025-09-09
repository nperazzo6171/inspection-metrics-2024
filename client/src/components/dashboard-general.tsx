import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { ClipboardList, AlertTriangle, CheckCircle, Clock, Filter, FileText, TrendingUp, Users, Target, Activity } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-generator";

interface DashboardGeneralProps {
  data: any[];
  reportData?: any;
  filters: any;
  onFilterChange: (filters: any) => void;
}

export default function DashboardGeneral({ data, reportData, filters, onFilterChange }: DashboardGeneralProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const applyFilters = () => {
    const filtersToApply = {
      ...localFilters,
      // Convert single values to arrays for backend compatibility
      unidade: localFilters.unidade && localFilters.unidade !== '' ? [localFilters.unidade] : undefined,
      departamento: localFilters.departamento && localFilters.departamento !== '' ? [localFilters.departamento] : undefined,
      naoConformidade: localFilters.naoConformidade && localFilters.naoConformidade !== '' ? [localFilters.naoConformidade] : undefined,
      ano: localFilters.ano && localFilters.ano !== '' ? localFilters.ano : undefined
    };
    onFilterChange(filtersToApply);
  };

  const handleGeneratePDF = () => {
    generatePDFReport('dashboard', data, reportData?.summary);
  };

  const handleGenerateNaoConformidadePDF = () => {
    if (localFilters.naoConformidade) {
      const filteredData = data.filter(item => 
        item.naoConformidade === localFilters.naoConformidade
      );
      generatePDFReport('nao-conformidade', filteredData, reportData?.summary, localFilters);
    } else {
      generatePDFReport('nao-conformidade', data, reportData?.summary, localFilters);
    }
  };

  // Use summary from reportData which has correct filtering logic
  const summary = reportData?.summary || {
    totalInspections: 0,
    totalNonCompliances: 0,
    withinDeadline: 0,
    nearDeadline: 0,
    overdue: 0,
    regularizados: 0,
    pendentes: 0,
    naoRegularizados: 0,
    totalControlePrazos: 0,
  };

  const departmentData = reportData?.charts?.departmentData || [];
  const statusData = reportData?.charts?.statusData || [];

  const COLORS = ['hsl(207, 90%, 54%)', 'hsl(142, 76%, 36%)', 'hsl(45, 93%, 47%)', 'hsl(0, 84%, 60%)'];
  
  // Função para determinar a cor baseada no nome da categoria
  const getColorForStatus = (statusName: string) => {
    switch(statusName) {
      case 'Com Prazo Vencido':
        return 'hsl(0, 84%, 60%)'; // Vermelho
      case 'Com Prazo Definido':
        return 'hsl(45, 93%, 47%)'; // Amarelo
      case 'Próximo do Vencimento':
        return 'hsl(142, 76%, 36%)'; // Verde
      case 'Sem Prazo Definido':
        return 'hsl(207, 90%, 54%)'; // Azul
      default:
        return 'hsl(207, 90%, 54%)'; // Azul padrão
    }
  };

  // Get unique values for filter dropdowns with proper sorting
  const uniqueDepartamentos = Array.from(new Set(data.map(item => item.departamento))).sort();
  const uniqueNaoConformidades = Array.from(new Set(data.map(item => item.naoConformidade))).sort();
  
  // Filter units based on selected department with better sorting
  const filteredUnidades = localFilters.departamento 
    ? Array.from(new Set(data.filter(item => item.departamento === localFilters.departamento).map(item => item.unidadeInspecionada)))
    : Array.from(new Set(data.map(item => item.unidadeInspecionada)));
  
  // Custom sorting function for units (numerical DTs first, then alphabetical)
  const sortUnidades = (units: string[]) => {
    return units.sort((a, b) => {
      // Extract numbers from DT names for numerical sorting
      const aMatch = a.match(/^(\d+)ª?\s*DT/);
      const bMatch = b.match(/^(\d+)ª?\s*DT/);
      
      if (aMatch && bMatch) {
        // Both are numbered DTs, sort numerically
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      } else if (aMatch) {
        // Only 'a' is numbered DT, it comes first
        return -1;
      } else if (bMatch) {
        // Only 'b' is numbered DT, it comes first
        return 1;
      } else {
        // Neither are numbered DTs, sort alphabetically
        return a.localeCompare(b, 'pt-BR');
      }
    });
  };
  
  const sortedFilteredUnidades = sortUnidades(filteredUnidades);
  
  // Reset unit filter when department changes
  const handleDepartmentChange = (value: string) => {
    setLocalFilters({...localFilters, departamento: value === 'all' ? '' : value, unidade: ''});
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Ano da Inspeção</Label>
              <Select value={localFilters.ano || 'all'} onValueChange={(value) => setLocalFilters({...localFilters, ano: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Departamento</Label>
              <Select value={localFilters.departamento || 'all'} onValueChange={handleDepartmentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os departamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os departamentos</SelectItem>
                  {uniqueDepartamentos.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Unidade Inspecionada</Label>
              <Select value={localFilters.unidade || 'all'} onValueChange={(value) => setLocalFilters({...localFilters, unidade: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {sortedFilteredUnidades.slice(0, 50).map((unidade: string) => (
                    <SelectItem key={unidade} value={unidade}>{unidade.length > 35 ? unidade.substring(0, 35) + '...' : unidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Não Conformidade</Label>
              <Select value={localFilters.naoConformidade || 'all'} onValueChange={(value) => setLocalFilters({...localFilters, naoConformidade: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as não conformidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as não conformidades</SelectItem>
                  {uniqueNaoConformidades.map(nc => (
                    <SelectItem key={nc} value={nc}>{nc.length > 25 ? nc.substring(0, 25) + '...' : nc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data Inicial</Label>
                  <Input 
                    type="date" 
                    onChange={(e) => setLocalFilters({...localFilters, dataInicial: e.target.value})}
                    value={localFilters.dataInicial || ''}
                  />
                </div>
                
                <div>
                  <Label>Data Final</Label>
                  <Input 
                    type="date" 
                    onChange={(e) => setLocalFilters({...localFilters, dataFinal: e.target.value})}
                    value={localFilters.dataFinal || ''}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={applyFilters} className="bg-police-blue hover:bg-blue-700">
              Aplicar Filtros
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setLocalFilters({});
                onFilterChange({});
              }}
            >
              Limpar
            </Button>
            {localFilters.naoConformidade && (
              <Button 
                onClick={handleGenerateNaoConformidadePDF}
                className="bg-green-600 hover:bg-green-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Relatório da Não Conformidade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modern Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main KPI Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">Visão Geral das Inspeções</h3>
                <p className="text-blue-100 mt-2">Resumo executivo dos dados de conformidade</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{summary.totalInspections}</p>
                      <p className="text-blue-100 text-sm">Total de Inspeções</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{summary.totalNonCompliances}</p>
                      <p className="text-blue-100 text-sm">Não Conformidades</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{summary.withinDeadline}</p>
                      <p className="text-blue-100 text-sm">Com Prazo Definido</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-400/30 rounded-lg">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{summary.nearDeadline}</p>
                      <p className="text-blue-100 text-sm">Prazo Vencido</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Regularização Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-emerald-800">
              <Activity className="w-6 h-6 mr-2" />
              Status de Regularização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-emerald-700">{summary.totalControlePrazos}</p>
              <p className="text-sm text-emerald-600">Total de Registros</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Regularizadas</span>
                </div>
                <Badge className="bg-green-500 text-white">{summary.regularizados}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-700">Pendentes</span>
                </div>
                <Badge className="bg-yellow-500 text-white">{summary.pendentes}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700">Não Regularizadas</span>
                </div>
                <Badge className="bg-red-500 text-white">{summary.naoRegularizados}</Badge>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Taxa de Regularização</span>
                <span>{summary.totalControlePrazos > 0 ? ((summary.regularizados / summary.totalControlePrazos) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: summary.totalControlePrazos > 0 ? `${(summary.regularizados / summary.totalControlePrazos) * 100}%` : '0%'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modern Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Chart - Enhanced */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold text-gray-800">Distribuição por Departamento</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Análise de inspeções realizadas por órgão</p>
            </div>
            <Button onClick={handleGeneratePDF} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <FileText className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  stroke="#6b7280"
                />
                <YAxis fontSize={12} stroke="#6b7280" />
                <Tooltip 
                  formatter={(value, name) => [value, 'Inspeções']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone"
                  dataKey="value" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Status Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-gray-800">Status dos Prazos</CardTitle>
            <p className="text-sm text-gray-500">Situação atual das cobranças</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Gráfico à esquerda */}
              <div className="flex-shrink-0">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={getColorForStatus(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} registros`, name]}
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
              <div className="flex-1 space-y-2">
                {statusData.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getColorForStatus(entry.name) }}
                      ></div>
                      <span className="text-gray-700 text-sm">{entry.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
