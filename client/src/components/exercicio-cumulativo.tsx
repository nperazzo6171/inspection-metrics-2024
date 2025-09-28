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
import { Target, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExercicioCumulativo() {
  const [filters, setFilters] = useState({
    unidade: '',
    status: '',
    ano: '',
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
      delegado: "Del. João Silva Santos",
      anoExercicio: "2024",
      periodoInicio: "2024-01-01",
      periodoFim: "2024-12-31",
      cargaHoraria: "40",
      horasCumpridas: "35",
      percentualCumprimento: "87.5",
      status: "em_andamento",
      observacoes: "Exercício dentro do prazo previsto"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      delegado: "Del. Maria Costa Lima",
      anoExercicio: "2024",
      periodoInicio: "2024-01-01",
      periodoFim: "2024-12-31",
      cargaHoraria: "40",
      horasCumpridas: "40",
      percentualCumprimento: "100",
      status: "concluido",
      observacoes: "Exercício cumulativo concluído com êxito"
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesAno = !filters.ano || item.anoExercicio === filters.ano;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.delegado.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesStatus && matchesAno && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>;
      case 'atrasado':
        return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pendente</Badge>;
    }
  };

  const getPercentualColor = (percentual: string) => {
    const valor = parseFloat(percentual);
    if (valor >= 90) return "text-green-600";
    if (valor >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório de Exercício Cumulativo', 20, 20);
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
        doc.text(`   Delegado: ${item.delegado}`, 20, yPos + 5);
        doc.text(`   Ano: ${item.anoExercicio}`, 20, yPos + 10);
        doc.text(`   Carga Horária: ${item.cargaHoraria}h - Cumpridas: ${item.horasCumpridas}h`, 20, yPos + 15);
        doc.text(`   Percentual: ${item.percentualCumprimento}%`, 20, yPos + 20);
        doc.text(`   Status: ${item.status}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `exercicio-cumulativo-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Controle de Exercício Cumulativo
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Exercício
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Exercício Cumulativo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unidade</Label>
                      <Input placeholder="Ex: 1ª DT - Salvador" />
                    </div>
                    <div>
                      <Label>Delegado</Label>
                      <Input placeholder="Nome do delegado" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Ano do Exercício</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Carga Horária (h)</Label>
                      <Input placeholder="Ex: 40" type="number" />
                    </div>
                    <div>
                      <Label>Horas Cumpridas (h)</Label>
                      <Input placeholder="Ex: 35" type="number" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Período Início</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Período Fim</Label>
                      <Input type="date" />
                    </div>
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
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea placeholder="Observações sobre o exercício..." />
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
            <p className="text-sm text-muted-foreground">Total de Exercícios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter(item => item.status === 'concluido').length}
            </div>
            <p className="text-sm text-muted-foreground">Concluídos</p>
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
            <div className="text-2xl font-bold text-red-600">
              {filteredData.filter(item => item.status === 'atrasado').length}
            </div>
            <p className="text-sm text-muted-foreground">Atrasados</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum exercício encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Delegado</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Carga Horária</TableHead>
                  <TableHead>Cumprimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell>{item.delegado}</TableCell>
                    <TableCell>{item.anoExercicio}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(item.periodoInicio).toLocaleDateString('pt-BR')}</div>
                        <div className="text-gray-500">até {new Date(item.periodoFim).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{item.horasCumpridas}h / {item.cargaHoraria}h</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentualCumprimento}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-bold ${getPercentualColor(item.percentualCumprimento)}`}>
                        {item.percentualCumprimento}%
                      </div>
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