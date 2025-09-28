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
import { Users, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PassagemGestao() {
  const [filters, setFilters] = useState({
    unidade: '',
    status: '',
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
      gestorAnterior: "Del. João Silva Santos",
      gestorAtual: "Del. Maria Costa Lima",
      dataPassagem: "2025-01-15",
      tipoPassagem: "Transferência",
      documentosEntregues: "Livros de ocorrência, inventário patrimonial, relatórios mensais",
      pendencias: "Aguardando assinatura do termo de responsabilidade",
      status: "em_andamento",
      observacoes: "Passagem de gestão em processo normal"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      gestorAnterior: "Del. Carlos Oliveira",
      gestorAtual: "Del. Ana Paula Rocha",
      dataPassagem: "2025-01-10",
      tipoPassagem: "Aposentadoria",
      documentosEntregues: "Todos os documentos obrigatórios entregues",
      pendencias: "Nenhuma pendência",
      status: "concluida",
      observacoes: "Passagem de gestão concluída com sucesso"
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.gestorAnterior.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.gestorAtual.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>;
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>;
      case 'pendente':
        return <Badge className="bg-red-100 text-red-800">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Indefinida</Badge>;
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório de Passagem de Gestão', 20, 20);
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
        
        doc.text(`${index + 1}. ${item.unidade}`, 20, yPos);
        doc.text(`   Gestor Anterior: ${item.gestorAnterior}`, 20, yPos + 5);
        doc.text(`   Gestor Atual: ${item.gestorAtual}`, 20, yPos + 10);
        doc.text(`   Data: ${new Date(item.dataPassagem).toLocaleDateString('pt-BR')}`, 20, yPos + 15);
        doc.text(`   Tipo: ${item.tipoPassagem}`, 20, yPos + 20);
        doc.text(`   Status: ${item.status}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `passagem-gestao-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Controle de Passagem de Gestão
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Passagem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Passagem de Gestão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Unidade</Label>
                    <Input placeholder="Ex: 1ª DT - Salvador" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Gestor Anterior</Label>
                      <Input placeholder="Nome do gestor anterior" />
                    </div>
                    <div>
                      <Label>Gestor Atual</Label>
                      <Input placeholder="Nome do novo gestor" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data da Passagem</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Tipo de Passagem</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Transferência">Transferência</SelectItem>
                          <SelectItem value="Aposentadoria">Aposentadoria</SelectItem>
                          <SelectItem value="Promoção">Promoção</SelectItem>
                          <SelectItem value="Exoneração">Exoneração</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Documentos Entregues</Label>
                    <Textarea placeholder="Liste os documentos entregues na passagem..." />
                  </div>

                  <div>
                    <Label>Pendências</Label>
                    <Textarea placeholder="Descreva as pendências existentes..." />
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
                        <SelectItem value="concluida">Concluída</SelectItem>
                      </SelectContent>
                    </Select>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-sm text-muted-foreground">Total de Passagens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter(item => item.status === 'concluida').length}
            </div>
            <p className="text-sm text-muted-foreground">Concluídas</p>
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
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma passagem encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Gestor Anterior</TableHead>
                  <TableHead>Gestor Atual</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Pendências</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <UserX className="w-4 h-4 mr-2 text-red-500" />
                        {item.gestorAnterior}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 mr-2 text-green-500" />
                        {item.gestorAtual}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.dataPassagem).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{item.tipoPassagem}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.pendencias}>
                      {item.pendencias}
                    </TableCell>
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