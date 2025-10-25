import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Building2,
  FileText,
  Calendar,
  Search,
  Download,
  XCircle,
  CheckCircle
} from "lucide-react";

interface Carceragem {
  id: number;
  unidade: string;
  departamento: string;
  statusInterdicao: "interditada" | "parcial" | "normal";
  decisaoJudicial: string;
  dataInterdicao: string;
  medidaDeterminada: string;
  historico: string;
  capacidade: number;
  ocupacao: number;
}

export default function CarceragensInterditadas() {
  const [searchTerm, setSearchTerm] = useState("");

  const mockData: Carceragem[] = [
    {
      id: 1,
      unidade: "1ª Delegacia Territorial",
      departamento: "DRACO",
      statusInterdicao: "interditada",
      decisaoJudicial: "Processo nº 12345-89.2024.8.05.0001",
      dataInterdicao: "2024-08-15",
      medidaDeterminada: "Interdição total até adequação estrutural e instalação de sistema de ventilação",
      historico: "Vistoria do MPE identificou superlotação e condições insalubres. Determinada interdição imediata.",
      capacidade: 20,
      ocupacao: 35
    },
    {
      id: 2,
      unidade: "Delegacia de Homicídios",
      departamento: "DHPP",
      statusInterdicao: "parcial",
      decisaoJudicial: "Processo nº 23456-78.2024.8.05.0002",
      dataInterdicao: "2024-11-10",
      medidaDeterminada: "Interdição parcial de 50% da capacidade até reforma do sistema elétrico",
      historico: "Laudo técnico apontou risco elétrico. Permitida ocupação reduzida.",
      capacidade: 30,
      ocupacao: 15
    },
    {
      id: 3,
      unidade: "DRFRV - Feira de Santana",
      departamento: "DRFRV",
      statusInterdicao: "interditada",
      decisaoJudicial: "Processo nº 34567-67.2024.8.05.0003",
      dataInterdicao: "2024-06-20",
      medidaDeterminada: "Interdição total por problemas estruturais graves e risco de desabamento",
      historico: "Engenharia constatou rachaduras estruturais. Interdição urgente determinada.",
      capacidade: 25,
      ocupacao: 0
    },
    {
      id: 4,
      unidade: "Delegacia de Tráfico",
      departamento: "DTE",
      statusInterdicao: "normal",
      decisaoJudicial: "",
      dataInterdicao: "",
      medidaDeterminada: "",
      historico: "Última vistoria sem irregularidades. Carceragem em condições adequadas.",
      capacidade: 40,
      ocupacao: 28
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      interditada: {
        label: "Interditada",
        color: "text-red-600",
        bgColor: "bg-red-50",
        badgeColor: "bg-red-100 text-red-800"
      },
      parcial: {
        label: "Interdição Parcial",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        badgeColor: "bg-yellow-100 text-yellow-800"
      },
      normal: {
        label: "Normal",
        color: "text-green-600",
        bgColor: "bg-green-50",
        badgeColor: "bg-green-100 text-green-800"
      }
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const filteredData = mockData.filter(item =>
    item.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    interditadas: mockData.filter(d => d.statusInterdicao === "interditada").length,
    parcial: mockData.filter(d => d.statusInterdicao === "parcial").length,
    normal: mockData.filter(d => d.statusInterdicao === "normal").length,
    total: mockData.length
  };

  const totalCapacidade = mockData.reduce((acc, item) => acc + item.capacidade, 0);
  const totalOcupacao = mockData.reduce((acc, item) => acc + item.ocupacao, 0);
  const percentualOcupacao = Math.round((totalOcupacao / totalCapacidade) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-orange-600" />
            Carceragens Interditadas
          </h2>
          <p className="text-slate-600 mt-1">
            Monitoramento de unidades com interdição judicial ou restrições
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-3">
            <CardDescription>Total de Unidades</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Com carceragem</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-3">
            <CardDescription>Interditadas</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.interditadas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {Math.round((stats.interditadas / stats.total) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription>Interdição Parcial</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.parcial}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Com restrições</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-3">
            <CardDescription>Normais</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.normal}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Sem interdição</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Ocupação Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Capacidade</p>
                  <p className="text-2xl font-bold text-slate-900">{totalCapacidade}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600">Ocupação</p>
                  <p className="text-2xl font-bold text-blue-600">{totalOcupacao}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-slate-600">Taxa</p>
                  <p className="text-2xl font-bold text-orange-600">{percentualOcupacao}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Ocupação Total</span>
                  <span className="font-semibold text-slate-900">
                    {totalOcupacao} / {totalCapacidade} pessoas
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      percentualOcupacao > 100 ? "bg-red-500" :
                      percentualOcupacao > 80 ? "bg-orange-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(percentualOcupacao, 100)}%` }}
                  />
                </div>
                {percentualOcupacao > 100 && (
                  <p className="text-xs text-red-600 font-semibold">
                    ⚠️ Superlotação detectada ({percentualOcupacao - 100}% acima da capacidade)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                <strong>Interdição Judicial:</strong> Determinação legal que proíbe ou restringe o uso de carceragem por não atender condições mínimas de segurança e dignidade.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">Principais motivos:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Superlotação</li>
                  <li>Condições insalubres</li>
                  <li>Problemas estruturais</li>
                  <li>Falta de ventilação</li>
                  <li>Sistema elétrico inadequado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unidades com Carceragem</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar unidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidade</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Data Interdição</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const statusInfo = getStatusInfo(item.statusInterdicao);
                const ocupacaoPercent = Math.round((item.ocupacao / item.capacidade) * 100);

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell>{item.departamento}</TableCell>
                    <TableCell>
                      <Badge className={statusInfo.badgeColor}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.capacidade}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{item.ocupacao}</span>
                        <Badge
                          className={
                            ocupacaoPercent > 100 ? "bg-red-100 text-red-800" :
                            ocupacaoPercent > 80 ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }
                        >
                          {ocupacaoPercent}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.dataInterdicao ?
                        new Date(item.dataInterdicao).toLocaleDateString("pt-BR") :
                        "-"
                      }
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Nenhuma unidade encontrada
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-l-4 border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Unidades com Interdição Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData
              .filter(d => d.statusInterdicao === "interditada")
              .map((item) => (
                <div key={item.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.unidade}</p>
                      <p className="text-sm text-slate-600">{item.departamento}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Interditada
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-slate-600">Data de Interdição:</p>
                        <p className="font-medium text-slate-900">
                          {new Date(item.dataInterdicao).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-slate-600">Decisão Judicial:</p>
                        <p className="font-medium text-slate-900">{item.decisaoJudicial}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-slate-600">Medida Determinada:</p>
                        <p className="font-medium text-slate-900">{item.medidaDeterminada}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
