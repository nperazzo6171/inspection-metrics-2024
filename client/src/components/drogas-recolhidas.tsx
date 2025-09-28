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
import { Package, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, Weight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DrogasRecolhidas() {
  const [filters, setFilters] = useState({
    unidade: '',
    tipoDroga: '',
    situacao: '',
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
      tipoDroga: "Cocaína",
      quantidade: "500",
      unidadeMedida: "gramas",
      dataRecolhimento: "2025-01-15",
      localRecolhimento: "Rua das Palmeiras, 789 - Salvador",
      responsavelRecolhimento: "Del. Carlos Santos",
      situacao: "depositada",
      numeroLaudo: "LAUDO-001/2025",
      observacoes: "Droga apreendida em operação policial"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      tipoDroga: "Maconha",
      quantidade: "2.5",
      unidadeMedida: "quilos",
      dataRecolhimento: "2025-01-10",
      localRecolhimento: "Av. Central, 456 - Feira de Santana",
      responsavelRecolhimento: "Del. Ana Lima",
      situacao: "destruida",
      numeroLaudo: "LAUDO-002/2025",
      observacoes: "Destruição autorizada pelo juiz"
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesTipo = !filters.tipoDroga || item.tipoDroga === filters.tipoDroga;
    const matchesSituacao = !filters.situacao || item.situacao === filters.situacao;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.tipoDroga.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.localRecolhimento.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesTipo && matchesSituacao && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'depositada':
        return <Badge className="bg-blue-100 text-blue-800">Depositada</Badge>;
      case 'destruida':
        return <Badge className="bg-gray-100 text-gray-800">Destruída</Badge>;
      case 'analisando':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Análise</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Apreendida</Badge>;
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório de Drogas Recolhidas', 20, 20);
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
        doc.text(`   Tipo: ${item.tipoDroga} - ${item.quantidade} ${item.unidadeMedida}`, 20, yPos + 5);
        doc.text(`   Recolhimento: ${new Date(item.dataRecolhimento).toLocaleDateString('pt-BR')}`, 20, yPos + 10);
        doc.text(`   Local: ${item.localRecolhimento}`, 20, yPos + 15);
        doc.text(`   Laudo: ${item.numeroLaudo}`, 20, yPos + 20);
        doc.text(`   Situação: ${item.situacao}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `drogas-recolhidas-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Package className="w-5 h-5 mr-2 text-orange-600" />
            Controle de Drogas Recolhidas
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Recolhimento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Recolhimento de Droga</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unidade</Label>
                      <Input placeholder="Ex: 1ª DT - Salvador" />
                    </div>
                    <div>
                      <Label>Tipo de Droga</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cocaína">Cocaína</SelectItem>
                          <SelectItem value="Maconha">Maconha</SelectItem>
                          <SelectItem value="Crack">Crack</SelectItem>
                          <SelectItem value="Heroína">Heroína</SelectItem>
                          <SelectItem value="Ecstasy">Ecstasy</SelectItem>
                          <SelectItem value="LSD">LSD</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Quantidade</Label>
                      <Input placeholder="Ex: 500" type="number" />
                    </div>
                    <div>
                      <Label>Unidade de Medida</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gramas">Gramas</SelectItem>
                          <SelectItem value="quilos">Quilos</SelectItem>
                          <SelectItem value="unidades">Unidades</SelectItem>
                          <SelectItem value="comprimidos">Comprimidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data Recolhimento</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div>
                    <Label>Local de Recolhimento</Label>
                    <Input placeholder="Endereço completo" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Responsável</Label>
                      <Input placeholder="Nome do responsável" />
                    </div>
                    <div>
                      <Label>Número do Laudo</Label>
                      <Input placeholder="Ex: LAUDO-001/2025" />
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Unidade</Label>
              <Input 
                placeholder="Filtrar por unidade" 
                value={filters.unidade}
                onChange={(e) => setFilters({...filters, unidade: e.target.value})}
              />
            </div>

            <div>
              <Label>Tipo de Droga</Label>
              <Select value={filters.tipoDroga} onValueChange={(value) => setFilters({...filters, tipoDroga: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Cocaína">Cocaína</SelectItem>
                  <SelectItem value="Maconha">Maconha</SelectItem>
                  <SelectItem value="Crack">Crack</SelectItem>
                  <SelectItem value="Heroína">Heroína</SelectItem>
                  <SelectItem value="Ecstasy">Ecstasy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Situação</Label>
              <Select value={filters.situacao} onValueChange={(value) => setFilters({...filters, situacao: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as situações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as situações</SelectItem>
                  <SelectItem value="depositada">Depositada</SelectItem>
                  <SelectItem value="destruida">Destruída</SelectItem>
                  <SelectItem value="analisando">Em Análise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar..." 
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => setFilters({ unidade: '', tipoDroga: '', situacao: '', searchTerm: '' })}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-sm text-muted-foreground">Total de Apreensões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {filteredData.filter(item => item.situacao === 'depositada').length}
            </div>
            <p className="text-sm text-muted-foreground">Depositadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-600">
              {filteredData.filter(item => item.situacao === 'destruida').length}
            </div>
            <p className="text-sm text-muted-foreground">Destruídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(item => item.situacao === 'analisando').length}
            </div>
            <p className="text-sm text-muted-foreground">Em Análise</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma droga encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Tipo de Droga</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data Recolhimento</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Laudo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell>{item.tipoDroga}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Weight className="w-4 h-4 mr-1 text-gray-500" />
                        {item.quantidade} {item.unidadeMedida}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.dataRecolhimento).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.localRecolhimento}>
                      {item.localRecolhimento}
                    </TableCell>
                    <TableCell>{item.responsavelRecolhimento}</TableCell>
                    <TableCell className="font-mono text-sm">{item.numeroLaudo}</TableCell>
                    <TableCell>{getSituacaoBadge(item.situacao)}</TableCell>
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