import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MilaeSemIP() {
  const [filters, setFilters] = useState({
    unidade: '',
    status: '',
    prioridade: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // Mock data for demonstration
  const mockData = [
    {
      id: 1,
      unidade: "1ª DT - Salvador",
      numeroMilae: "MILAE-001/2025",
      dataRegistro: "2025-01-15",
      natureza: "Homicídio",
      vitima: "João da Silva",
      local: "Rua das Palmeiras, 123 - Salvador",
      delegadoResponsavel: "Del. Carlos Santos",
      diasSemIP: 45,
      motivoAtraso: "Aguardando laudos periciais",
      prioridade: "alta",
      status: "pendente",
      observacoes: "Caso complexo aguardando perícia"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      numeroMilae: "MILAE-002/2025",
      dataRegistro: "2025-01-10",
      natureza: "Roubo",
      vitima: "Maria dos Santos",
      local: "Av. Central, 456 - Feira de Santana",
      delegadoResponsavel: "Del. Ana Lima",
      diasSemIP: 30,
      motivoAtraso: "Aguardando oitiva de testemunhas",
      prioridade: "media",
      status: "em_andamento",
      observacoes: "Investigação em andamento"
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesPrioridade = !filters.prioridade || item.prioridade === filters.prioridade;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.numeroMilae.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.natureza.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.vitima.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesStatus && matchesPrioridade && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'instaurado':
        return <Badge className="bg-green-100 text-green-800">IP Instaurado</Badge>;
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>;
      case 'pendente':
        return <Badge className="bg-red-100 text-red-800">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Indefinido</Badge>;
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <Badge className="bg-red-100 text-red-800">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      case 'baixa':
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Não definida</Badge>;
    }
  };

  const getDiasColor = (dias: number) => {
    if (dias > 60) return "text-red-600 font-bold";
    if (dias > 30) return "text-yellow-600 font-medium";
    return "text-green-600";
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório MILAE sem Instauração de IP', 20, 20);
      doc.setFontSize(12);
      doc.text('Polícia Civil do Estado da Bahia - ASTEC/CORREPOL', 20, 30);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
      
      let yPos = 60;
      doc.setFontSize(10);
      
      filteredData.forEach((item, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${index + 1}. ${item.numeroMilae} - ${item.unidade}`, 20, yPos);
        doc.text(`   Natureza: ${item.natureza} - Vítima: ${item.vitima}`, 20, yPos + 5);
        doc.text(`   Registro: ${new Date(item.dataRegistro).toLocaleDateString('pt-BR')}`, 20, yPos + 10);
        doc.text(`   Dias sem IP: ${item.diasSemIP} dias`, 20, yPos + 15);
        doc.text(`   Motivo: ${item.motivoAtraso}`, 20, yPos + 20);
        doc.text(`   Status: ${item.status} - Prioridade: ${item.prioridade}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `milae-sem-ip-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({ 
        title: "PDF gerado com sucesso!", 
        description: `Relatório ${fileName} foi baixado`
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({ 
        title: "Erro ao gerar PDF", 
        description: "Erro ao gerar relatório",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            MILAE sem Instauração de IP
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo MILAE
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo MILAE sem IP</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unidade</Label>
                      <Input placeholder="Ex: 1ª DT - Salvador" />
                    </div>
                    <div>
                      <Label>Número MILAE</Label>
                      <Input placeholder="Ex: MILAE-001/2025" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Registro</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Natureza</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a natureza" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Homicídio">Homicídio</SelectItem>
                          <SelectItem value="Roubo">Roubo</SelectItem>
                          <SelectItem value="Furto">Furto</SelectItem>
                          <SelectItem value="Estupro">Estupro</SelectItem>
                          <SelectItem value="Tráfico">Tráfico</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Vítima</Label>
                      <Input placeholder="Nome da vítima" />
                    </div>
                    <div>
                      <Label>Delegado Responsável</Label>
                      <Input placeholder="Nome do delegado" />
                    </div>
                  </div>

                  <div>
                    <Label>Local do Fato</Label>
                    <Input placeholder="Endereço completo" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prioridade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="instaurado">IP Instaurado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Motivo do Atraso</Label>
                    <Textarea placeholder="Descreva o motivo do atraso na instauração..." />
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea placeholder="Observações adicionais..." />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={generatePDF} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-sm text-muted-foreground">Total de MILAE</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredData.filter(item => item.prioridade === 'alta').length}
            </div>
            <p className="text-sm text-muted-foreground">Alta Prioridade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(item => item.status === 'pendente').length}
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter(item => item.status === 'instaurado').length}
            </div>
            <p className="text-sm text-muted-foreground">IP Instaurados</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum MILAE encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>MILAE</TableHead>
                  <TableHead>Natureza</TableHead>
                  <TableHead>Vítima</TableHead>
                  <TableHead>Data Registro</TableHead>
                  <TableHead>Dias sem IP</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell className="font-mono text-sm">{item.numeroMilae}</TableCell>
                    <TableCell>{item.natureza}</TableCell>
                    <TableCell>{item.vitima}</TableCell>
                    <TableCell>{new Date(item.dataRegistro).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getDiasColor(item.diasSemIP)}`}>
                        <Clock className="w-4 h-4 mr-1" />
                        {item.diasSemIP} dias
                      </div>
                    </TableCell>
                    <TableCell>{getPrioridadeBadge(item.prioridade)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-8 px-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8 px-2">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}