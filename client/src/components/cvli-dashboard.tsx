import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
  Download
} from "lucide-react";

export default function CVLIDashboard() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedDepartamento, setSelectedDepartamento] = useState("todos");

  const cvliData = [
    { mes: "Jan", homicidios: 12, latrocinios: 3, lesoes: 2, total: 17 },
    { mes: "Fev", homicidios: 15, latrocinios: 4, lesoes: 1, total: 20 },
    { mes: "Mar", homicidios: 10, latrocinios: 2, lesoes: 3, total: 15 },
    { mes: "Abr", homicidios: 18, latrocinios: 5, lesoes: 2, total: 25 },
    { mes: "Mai", homicidios: 14, latrocinios: 3, lesoes: 4, total: 21 },
    { mes: "Jun", homicidios: 11, latrocinios: 2, lesoes: 1, total: 14 }
  ];

  const departamentoData = [
    { nome: "DRACO", total: 45, variacao: -12 },
    { nome: "DHPP", total: 38, variacao: 8 },
    { nome: "DRFRV", total: 28, variacao: -5 },
    { nome: "DTE", total: 22, variacao: 15 },
    { nome: "DEAM", total: 18, variacao: -3 }
  ];

  const tiposData = [
    { name: "Homicídios", value: 80, color: "#ef4444" },
    { name: "Latrocínios", value: 19, color: "#f97316" },
    { name: "Lesões Corporais", value: 13, color: "#eab308" }
  ];

  const totalCVLI = cvliData.reduce((acc, item) => acc + item.total, 0);
  const mediaMensal = Math.round(totalCVLI / cvliData.length);
  const ultimoMes = cvliData[cvliData.length - 1];
  const variacaoMensal = ultimoMes.total - cvliData[cvliData.length - 2].total;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-8 w-8 text-red-600" />
            CVLI - Crimes Violentos Letais Intencionais
          </h2>
          <p className="text-slate-600 mt-1">
            Monitoramento de homicídios, latrocínios e lesões corporais seguidas de morte
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Depart.</SelectItem>
              <SelectItem value="draco">DRACO</SelectItem>
              <SelectItem value="dhpp">DHPP</SelectItem>
              <SelectItem value="drfrv">DRFRV</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-3">
            <CardDescription>Total CVLI ({selectedYear})</CardDescription>
            <CardTitle className="text-3xl text-red-600">{totalCVLI}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm">
              {variacaoMensal < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-semibold">{Math.abs(variacaoMensal)}</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-semibold">+{variacaoMensal}</span>
                </>
              )}
              <span className="text-slate-600 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardHeader className="pb-3">
            <CardDescription>Média Mensal</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{mediaMensal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Casos por mês</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader className="pb-3">
            <CardDescription>Homicídios</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {cvliData.reduce((acc, item) => acc + item.homicidios, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {Math.round((80 / totalCVLI) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription>Latrocínios</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {cvliData.reduce((acc, item) => acc + item.latrocinios, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {Math.round((19 / totalCVLI) * 100)}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal de CVLI</CardTitle>
            <CardDescription>Distribuição por tipo de crime</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cvliData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="homicidios" fill="#a855f7" name="Homicídios" />
                <Bar dataKey="latrocinios" fill="#f97316" name="Latrocínios" />
                <Bar dataKey="lesoes" fill="#eab308" name="Lesões Corporais" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de CVLI</CardTitle>
            <CardDescription>Total de casos ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cvliData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Total CVLI"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Crime</CardTitle>
            <CardDescription>Proporção de cada categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tiposData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tiposData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CVLI por Departamento</CardTitle>
            <CardDescription>Ranking e variação percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departamentoData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-slate-700">{index + 1}º</Badge>
                    <div>
                      <p className="font-semibold text-slate-900">{dept.nome}</p>
                      <p className="text-sm text-slate-600">{dept.total} casos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dept.variacao < 0 ? (
                      <>
                        <TrendingDown className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-bold">{dept.variacao}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-bold">+{dept.variacao}%</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Definição de CVLI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 mb-4">
            Os Crimes Violentos Letais Intencionais (CVLI) são um conjunto de delitos que resultam na morte da vítima por ação intencional. Incluem:
          </p>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <Badge className="bg-purple-100 text-purple-800 mt-1">1</Badge>
              <div>
                <strong>Homicídios:</strong> Morte intencional de uma pessoa causada por outra, incluindo qualificados, simples e dolosos.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Badge className="bg-orange-100 text-orange-800 mt-1">2</Badge>
              <div>
                <strong>Latrocínios:</strong> Roubo seguido de morte, configurando crime contra o patrimônio com resultado letal.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 mt-1">3</Badge>
              <div>
                <strong>Lesões Corporais Seguidas de Morte:</strong> Agressão física que resulta em morte não intencional da vítima.
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
