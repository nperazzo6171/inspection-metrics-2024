import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, FileText, Info, ExternalLink, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-generator";
import { useQuery } from "@tanstack/react-query";

interface NormalizationProps {
  data: any[];
  reportData?: any;
}

export default function Normalization({ data, reportData }: NormalizationProps) {
  // Buscar dados de controle de prazos para integração
  const { data: controlePrazos = [] } = useQuery<any[]>({
    queryKey: ['/api/controle-prazos'],
  });

  const nonComplianceData = reportData?.charts?.nonComplianceData || 
    data.reduce((acc: any[], item) => {
      const compliance = acc.find(c => c.name === item.naoConformidade);
      if (compliance) {
        compliance.value += 1;
      } else {
        acc.push({ name: item.naoConformidade, value: 1 });
      }
      return acc;
    }, []);

  // Função para truncar texto longo
  const truncateText = (text: string, maxLength: number = 40) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Cores vibrantes para o gráfico
  const colors = [
    '#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed',
    '#0891b2', '#ea580c', '#65a30d', '#db2777', '#4f46e5'
  ];

  // Preparar dados para o gráfico com cores e texto truncado - Top 20
  const chartData = nonComplianceData
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 20)
    .map((item: any, index: number) => ({
      ...item,
      name: truncateText(item.name, 25),
      fullName: item.name,
      fill: colors[index % colors.length]
    }));

  // Estatísticas de regularização
  const statusStats = {
    regularizado: controlePrazos.filter(item => item.status === 'regularizado').length,
    pendente: controlePrazos.filter(item => item.status === 'pendente').length,
    naoRegularizado: controlePrazos.filter(item => item.status === 'nao_regularizado').length,
    total: controlePrazos.length
  };

  // Dados para gráfico de pizza de status
  const statusPieData = [
    { name: 'Regularizado', value: statusStats.regularizado, fill: '#10b981' },
    { name: 'Pendente', value: statusStats.pendente, fill: '#f59e0b' },
    { name: 'Não Regularizado', value: statusStats.naoRegularizado, fill: '#ef4444' }
  ];

  // Pendentes com link SEI
  const pendentesComSei = controlePrazos.filter(item => 
    item.status === 'pendente' && item.linkSei
  );

  const handleGenerateReport = () => {
    generatePDFReport('normalization', data, { nonComplianceData });
  };

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total de Não Conformidades</p>
                <p className="text-2xl font-bold text-blue-700">{data.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Regularizados</p>
                <p className="text-2xl font-bold text-green-700">{statusStats.regularizado}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-700">{statusStats.pendente}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Não Regularizados</p>
                <p className="text-2xl font-bold text-red-700">{statusStats.naoRegularizado}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção principal com gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de barras das não conformidades */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              Top 20 Não Conformidades Mais Frequentes
            </CardTitle>
            <Button onClick={handleGenerateReport} className="bg-police-blue hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  fontSize={8} 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value} ocorrências`,
                    props.payload?.fullName || name
                  ]}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza do status de regularização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <div className="w-1 h-6 bg-green-600 rounded-full mr-3"></div>
              Status de Regularização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} itens`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2 mt-4">
              {statusPieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.fill }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <Badge variant="outline" style={{ borderColor: item.fill, color: item.fill }}>
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de pendentes com processo SEI */}
      {pendentesComSei.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExternalLink className="w-5 h-5 mr-2 text-yellow-600" />
              Pendentes de Regularização com Processo SEI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendentesComSei.slice(0, 6).map((item: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-yellow-400 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{item.unidade}</span>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          Pendente
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{item.naoConformidade}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Ofício: {item.oficio}</span>
                        {item.linkSei && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-6 px-2 text-xs"
                            onClick={() => window.open(item.linkSei, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            SEI
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {pendentesComSei.length > 6 && (
              <div className="text-center mt-4">
                <Badge variant="secondary">
                  +{pendentesComSei.length - 6} outros pendentes com processo SEI
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
