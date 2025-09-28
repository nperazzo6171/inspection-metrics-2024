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
import { Car, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VeiculosApreendidos() {
  const [filters, setFilters] = useState({
    unidade: '',
    tipoVeiculo: '',
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
      tipoVeiculo: "Automóvel",
      marca: "Volkswagen",
      modelo: "Gol",
      ano: "2018",
      placa: "ABC-1234",
      chassi: "9BWZZZ377VT004251",
      cor: "Branco",
      dataApreensao: "2025-01-15",
      localApreensao: "Rua das Acácias, 123 - Salvador",
      responsavelApreensao: "Del. Roberto Silva",
      situacao: "apreendido",
      motivoApreensao: "Veículo utilizado em crime",
      observacoes: "Veículo em bom estado de conservação"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      tipoVeiculo: "Motocicleta",
      marca: "Honda",
      modelo: "CG 160",
      ano: "2020",
      placa: "DEF-5678",
      chassi: "9C2JC3000LR123456",
      cor: "Vermelha",
      dataApreensao: "2025-01-10",
      localApreensao: "Av. Getúlio Vargas, 789 - Feira de Santana",
      responsavelApreensao: "Del. Patricia Lima",
      situacao: "devolvido",
      motivoApreensao: "Documentação irregular",
      observacoes: "Documentação regularizada e veículo devolvido"
    }
  ];

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesTipo = !filters.tipoVeiculo || item.tipoVeiculo === filters.tipoVeiculo;
    const matchesSituacao = !filters.situacao || item.situacao === filters.situacao;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.marca.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.modelo.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.placa.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesTipo && matchesSituacao && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'apreendido':
        return <Badge className="bg-red-100 text-red-800">Apreendido</Badge>;
      case 'devolvido':
        return <Badge className="bg-green-100 text-green-800">Devolvido</Badge>;
      case 'leilao':
        return <Badge className="bg-blue-100 text-blue-800">Leilão</Badge>;
      case 'destruido':
        return <Badge className="bg-gray-100 text-gray-800">Destruído</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Em Análise</Badge>;
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório de Veículos Apreendidos', 20, 20);
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
        doc.text(`   Veículo: ${item.marca} ${item.modelo} ${item.ano}`, 20, yPos + 5);
        doc.text(`   Placa: ${item.placa} - Chassi: ${item.chassi}`, 20, yPos + 10);
        doc.text(`   Apreensão: ${new Date(item.dataApreensao).toLocaleDateString('pt-BR')}`, 20, yPos + 15);
        doc.text(`   Local: ${item.localApreensao}`, 20, yPos + 20);
        doc.text(`   Situação: ${item.situacao}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `veiculos-apreendidos-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Car className="w-5 h-5 mr-2 text-blue-600" />
            Controle de Veículos Apreendidos
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Apreensão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Nova Apreensão de Veículo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Unidade</Label>
                      <Input placeholder="Ex: 1ª DT - Salvador" />
                    </div>
                    <div>
                      <Label>Tipo de Veículo</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Automóvel">Automóvel</SelectItem>
                          <SelectItem value="Motocicleta">Motocicleta</SelectItem>
                          <SelectItem value="Caminhão">Caminhão</SelectItem>
                          <SelectItem value="Ônibus">Ônibus</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Marca</Label>
                      <Input placeholder="Ex: Volkswagen" />
                    </div>
                    <div>
                      <Label>Modelo</Label>
                      <Input placeholder="Ex: Gol" />
                    </div>
                    <div>
                      <Label>Ano</Label>
                      <Input placeholder="Ex: 2018" type="number" />
                    </div>
                    <div>
                      <Label>Cor</Label>
                      <Input placeholder="Ex: Branco" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Placa</Label>
                      <Input placeholder="Ex: ABC-1234" />
                    </div>
                    <div>
                      <Label>Chassi</Label>
                      <Input placeholder="Número do chassi" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Apreensão</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Situação</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a situação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apreendido">Apreendido</SelectItem>
                          <SelectItem value="devolvido">Devolvido</SelectItem>
                          <SelectItem value="leilao">Leilão</SelectItem>
                          <SelectItem value="destruido">Destruído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Local de Apreensão</Label>
                    <Input placeholder="Endereço completo da apreensão" />
                  </div>

                  <div>
                    <Label>Responsável pela Apreensão</Label>
                    <Input placeholder="Nome do delegado/agente responsável" />
                  </div>

                  <div>
                    <Label>Motivo da Apreensão</Label>
                    <Textarea placeholder="Descreva o motivo da apreensão..." />
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
            <p className="text-sm text-muted-foreground">Total de Veículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredData.filter(item => item.situacao === 'apreendido').length}
            </div>
            <p className="text-sm text-muted-foreground">Apreendidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter(item => item.situacao === 'devolvido').length}
            </div>
            <p className="text-sm text-muted-foreground">Devolvidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {filteredData.filter(item => item.situacao === 'leilao').length}
            </div>
            <p className="text-sm text-muted-foreground">Para Leilão</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum veículo encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Placa/Chassi</TableHead>
                  <TableHead>Data Apreensão</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.unidade}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.marca} {item.modelo}</div>
                        <div className="text-sm text-gray-500">{item.ano} - {item.cor}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">
                        <div>{item.placa}</div>
                        <div className="text-xs text-gray-500">{item.chassi}</div>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(item.dataApreensao).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.localApreensao}>
                      {item.localApreensao}
                    </TableCell>
                    <TableCell>{item.responsavelApreensao}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.motivoApreensao}>
                      {item.motivoApreensao}
                    </TableCell>
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