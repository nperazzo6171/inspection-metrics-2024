import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CheckCircle,
  AlertCircle,
  XCircle,
  Lock,
  Search,
  FileText,
  TrendingUp,
  Download
} from "lucide-react";

interface CadeiaCustodia {
  id: number;
  unidade: string;
  departamento: string;
  status: "plena" | "parcial" | "nao_implementada";
  dataAvaliacao: string;
  observacoes: string;
  acoesCorretivas: string;
}

export default function CadeiaCustodia() {
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const mockData: CadeiaCustodia[] = [
    {
      id: 1,
      unidade: "1ª Delegacia Territorial",
      departamento: "DRACO",
      status: "plena",
      dataAvaliacao: "2025-01-15",
      observacoes: "Todos os procedimentos implementados conforme legislação",
      acoesCorretivas: ""
    },
    {
      id: 2,
      unidade: "Delegacia de Homicídios",
      departamento: "DHPP",
      status: "parcial",
      dataAvaliacao: "2025-01-10",
      observacoes: "Sistema de registro implementado, falta treinamento de equipe",
      acoesCorretivas: "Capacitação programada para fevereiro/2025"
    },
    {
      id: 3,
      unidade: "DRFRV - Feira de Santana",
      departamento: "DRFRV",
      status: "nao_implementada",
      dataAvaliacao: "2024-12-20",
      observacoes: "Ausência de sistema de controle e procedimentos formalizados",
      acoesCorretivas: "Aquisição de equipamentos e implantação prevista para março/2025"
    },
    {
      id: 4,
      unidade: "Delegacia Especializada",
      departamento: "DEAM",
      status: "plena",
      dataAvaliacao: "2025-01-18",
      observacoes: "Implementação completa com auditoria positiva",
      acoesCorretivas: ""
    },
    {
      id: 5,
      unidade: "Delegacia de Tráfico",
      departamento: "DTE",
      status: "parcial",
      dataAvaliacao: "2025-01-05",
      observacoes: "Estrutura física adequada, pendente protocolo de transferência",
      acoesCorretivas: "Elaboração de protocolo em andamento"
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      plena: {
        label: "Implementação Plena",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        badgeColor: "bg-green-100 text-green-800"
      },
      parcial: {
        label: "Implementação Parcial",
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        badgeColor: "bg-yellow-100 text-yellow-800"
      },
      nao_implementada: {
        label: "Não Implementada",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        badgeColor: "bg-red-100 text-red-800"
      }
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const filteredData = mockData.filter(item => {
    const matchesStatus = filterStatus === "todos" || item.status === filterStatus;
    const matchesSearch = item.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    plena: mockData.filter(d => d.status === "plena").length,
    parcial: mockData.filter(d => d.status === "parcial").length,
    nao_implementada: mockData.filter(d => d.status === "nao_implementada").length,
    total: mockData.length
  };

  const percentualImplementacao = Math.round(((stats.plena + (stats.parcial * 0.5)) / stats.total) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-8 w-8 text-blue-600" />
            Cadeia de Custódia
          </h2>
          <p className="text-slate-600 mt-1">
            Status de implementação da cadeia de custódia por unidade policial
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
            <p className="text-sm text-slate-600">Unidades avaliadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-3">
            <CardDescription>Implementação Plena</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.plena}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              {Math.round((stats.plena / stats.total) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription>Implementação Parcial</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.parcial}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Requer ações corretivas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-3">
            <CardDescription>Não Implementada</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.nao_implementada}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Implementação urgente
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Percentual Geral de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Progresso Total</span>
              <span className="text-2xl font-bold text-blue-600">{percentualImplementacao}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${percentualImplementacao}%` }}
              />
            </div>
            <p className="text-sm text-slate-600">
              Meta: 90% de implementação plena até dezembro/2025
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Unidades Policiais</CardTitle>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar unidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="plena">Plena</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="nao_implementada">Não Implementada</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Data Avaliação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => {
                const statusInfo = getStatusInfo(item.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell>{item.departamento}</TableCell>
                    <TableCell>
                      <Badge className={statusInfo.badgeColor}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.dataAvaliacao).toLocaleDateString("pt-BR")}
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
              Nenhuma unidade encontrada com os filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Ações Corretivas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData
                .filter(d => d.status !== "plena" && d.acoesCorretivas)
                .map((item) => (
                  <div key={item.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-slate-900">{item.unidade}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.acoesCorretivas}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Sobre Cadeia de Custódia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                A cadeia de custódia é o conjunto de procedimentos para manter e documentar a história cronológica de uma evidência desde sua coleta até o destino final.
              </p>
              <div className="space-y-2">
                <p className="font-semibold">Etapas principais:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reconhecimento e coleta</li>
                  <li>Registro e lacração</li>
                  <li>Transporte seguro</li>
                  <li>Armazenamento adequado</li>
                  <li>Rastreamento e controle</li>
                  <li>Descarte ou devolução</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
