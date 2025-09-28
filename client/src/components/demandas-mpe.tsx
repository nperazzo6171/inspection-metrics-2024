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
import { Gavel, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DemandasMPE() {
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
      numeroOficio: "OF-MPE-001/2025",
      dataRecebimento: "2025-01-15",
      promotor: "Dr. Carlos Alberto Silva",
      assunto: "Solicitação de diligências complementares",
      descricao: "Requisição de oitiva de testemunhas adicionais no IP 001/2025",
      prazoResposta: "2025-02-15",
      diasRestantes: 15,
      responsavel: "Del. João Santos",
      status: "em_andamento",
      prioridade: "alta",
      observacoes: "Diligências em execução"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      numeroOficio: "OF-MPE-002/2025",
      dataRecebimento: "2025-01-10",
      promotor: "Dra. Maria Fernanda Costa",
      assunto: "Esclarecimentos sobre procedimento",
      descricao: "Solicitação de esclarecimentos sobre IP 002/2025",
      prazoResposta: "2025-02-10",
      diasRestantes: 10,
      responsavel: "Del. Ana Lima",
      status: "respondido",
      prioridade: "media",
      observacoes: "Resposta enviada dentro do prazo"
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesPrioridade = !filters.prioridade || item.prioridade === filters.prioridade;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.numeroOficio.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.promotor.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.assunto.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesStatus && matchesPrioridade && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'respondido':
        return <Badge className="bg-green-100 text-green-800">Respondido</Badge>;
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>;
      case 'pendente':
        return <Badge className="bg-red-100 text-red-800">Pendente</Badge>;
      case 'vencido':
        return <Badge className="bg-gray-100 text-gray-800">Vencido</Badge>;
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
    if (dias <= 0) return "text-red-600 font-bold";
    if (dias <= 7) return "text-yellow-600 font-medium";
    return "text-green-600";
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório de Demandas do MPE', 20, 20);
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
        
        doc.text(`${index + 1}. ${item.numeroOficio} - ${item.unidade}`, 20, yPos);
        doc.text(`   Promotor: ${item.promotor}`, 20, yPos + 5);
        doc.text(`   Assunto: ${item.assunto}`, 20, yPos + 10);
        doc.text(`   Recebimento: ${new Date(item.dataRecebimento).toLocaleDateString('pt-BR')}`, 20, yPos + 15);
        doc.text(`   Prazo: ${new Date(item.prazoResposta).toLocaleDateString('pt-BR')} (${item.diasRestantes} dias)`, 20, yPos + 20);
        doc.text(`   Status: ${item.status} - Prioridade: ${item.prioridade}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `demandas-mpe-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Gavel className="w-5 h-5 mr-2 text-indigo-600" />
            Demandas do Ministério Público Estadual
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Demanda
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Demanda do MPE</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unidade</Label>
                      <Input placeholder="Ex: 1ª DT - Salvador" />
                    </div>
                    <div>
                      <Label>Número do Ofício</Label>
                      <Input placeholder="Ex: OF-MPE-001/2025" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Recebimento</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Prazo para Resposta</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Promotor</Label>
                      <Input placeholder="Nome do promotor" />
                    </div>
                    <div>
                      <Label>Responsável</Label>
                      <Input placeholder="Delegado responsável" />
                    </div>
                  </div>

                  <div>
                    <Label>Assunto</Label>
                    <Input placeholder="Assunto da demanda" />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea placeholder="Descrição detalhada da demanda..." />
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
                          <SelectItem value="respondido">Respondido</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
            <p className="text-sm text-muted-foreground">Total de Demandas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredData.filter(item => item.status === 'pendente').length}
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(item => item.status === 'em_andamento').length}
            </div>
            <p className="text-sm text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter(item => item.status === 'respondido').length}
            </div>
            <p className="text-sm text-muted-foreground">Respondidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma demanda encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Ofício</TableHead>
                  <TableHead>Promotor</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Recebimento</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell className="font-mono text-sm">{item.numeroOficio}</TableCell>
                    <TableCell>{item.promotor}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.assunto}>
                      {item.assunto}
                    </TableCell>
                    <TableCell>{new Date(item.dataRecebimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{new Date(item.prazoResposta).toLocaleDateString('pt-BR')}</div>
                        <div className={`text-xs ${getDiasColor(item.diasRestantes)}`}>
                          {item.diasRestantes > 0 ? `${item.diasRestantes} dias restantes` : `${Math.abs(item.diasRestantes)} dias em atraso`}
                        </div>
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