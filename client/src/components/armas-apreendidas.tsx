import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Zap, FileText, Plus, ChevronLeft, ChevronRight, Filter, Search, Edit, Trash2, Calendar, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const armaSchema = z.object({
  unidade: z.string().min(1, "Unidade é obrigatória"),
  tipoArma: z.string().min(1, "Tipo de arma é obrigatório"),
  calibre: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  numeroSerie: z.string().optional(),
  dataApreensao: z.string().min(1, "Data de apreensão é obrigatória"),
  localApreensao: z.string().min(1, "Local de apreensão é obrigatório"),
  responsavelApreensao: z.string().min(1, "Responsável é obrigatório"),
  situacao: z.enum(["apreendida", "destruida", "devolvida", "depositada"]),
  observacoes: z.string().optional(),
});

type ArmaForm = z.infer<typeof armaSchema>;

export default function ArmasApreendidas() {
  const [filters, setFilters] = useState({
    unidade: '',
    tipoArma: '',
    situacao: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockData = [
    {
      id: 1,
      unidade: "1ª DT - Salvador",
      tipoArma: "Pistola",
      calibre: ".380",
      marca: "Taurus",
      modelo: "PT-938",
      numeroSerie: "ABC123456",
      dataApreensao: "2025-01-15",
      localApreensao: "Rua das Flores, 123 - Salvador",
      responsavelApreensao: "Del. João Silva",
      situacao: "apreendida",
      observacoes: "Arma encontrada durante operação policial"
    },
    {
      id: 2,
      unidade: "2ª DT - Feira de Santana",
      tipoArma: "Revólver",
      calibre: ".38",
      marca: "Rossi",
      modelo: "R-351",
      numeroSerie: "DEF789012",
      dataApreensao: "2025-01-10",
      localApreensao: "Av. Principal, 456 - Feira de Santana",
      responsavelApreensao: "Del. Maria Costa",
      situacao: "depositada",
      observacoes: "Arma depositada no arsenal da unidade"
    }
  ];

  const form = useForm<ArmaForm>({
    resolver: zodResolver(armaSchema),
    defaultValues: {
      unidade: "",
      tipoArma: "",
      calibre: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      dataApreensao: "",
      localApreensao: "",
      responsavelApreensao: "",
      situacao: "apreendida",
      observacoes: "",
    },
  });

  const filteredData = mockData.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade.includes(filters.unidade);
    const matchesTipo = !filters.tipoArma || item.tipoArma === filters.tipoArma;
    const matchesSituacao = !filters.situacao || item.situacao === filters.situacao;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.tipoArma.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.marca.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesTipo && matchesSituacao && matchesSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'apreendida':
        return <Badge className="bg-red-100 text-red-800">Apreendida</Badge>;
      case 'destruida':
        return <Badge className="bg-gray-100 text-gray-800">Destruída</Badge>;
      case 'devolvida':
        return <Badge className="bg-green-100 text-green-800">Devolvida</Badge>;
      case 'depositada':
        return <Badge className="bg-blue-100 text-blue-800">Depositada</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Indefinida</Badge>;
    }
  };

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Relatório de Armas Apreendidas', 20, 20);
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
        doc.text(`   Tipo: ${item.tipoArma} ${item.calibre} - ${item.marca} ${item.modelo}`, 20, yPos + 5);
        doc.text(`   Série: ${item.numeroSerie}`, 20, yPos + 10);
        doc.text(`   Apreensão: ${new Date(item.dataApreensao).toLocaleDateString('pt-BR')}`, 20, yPos + 15);
        doc.text(`   Local: ${item.localApreensao}`, 20, yPos + 20);
        doc.text(`   Situação: ${item.situacao}`, 20, yPos + 25);
        
        yPos += 35;
      });
      
      const fileName = `armas-apreendidas-${new Date().toISOString().split('T')[0]}.pdf`;
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
            <Zap className="w-5 h-5 mr-2 text-red-600" />
            Controle de Armas Apreendidas
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Apreensão
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Apreensão de Arma' : 'Nova Apreensão de Arma'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="unidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 1ª DT - Salvador" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tipoArma"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Arma</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Pistola">Pistola</SelectItem>
                                <SelectItem value="Revólver">Revólver</SelectItem>
                                <SelectItem value="Espingarda">Espingarda</SelectItem>
                                <SelectItem value="Rifle">Rifle</SelectItem>
                                <SelectItem value="Submetralhadora">Submetralhadora</SelectItem>
                                <SelectItem value="Arma Branca">Arma Branca</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="calibre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calibre</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: .380, .38" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="marca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Taurus, Glock" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="modelo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: PT-938" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="numeroSerie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série</FormLabel>
                          <FormControl>
                            <Input placeholder="Número de série da arma" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dataApreensao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Apreensão</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="situacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Situação</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a situação" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apreendida">Apreendida</SelectItem>
                                <SelectItem value="destruida">Destruída</SelectItem>
                                <SelectItem value="devolvida">Devolvida</SelectItem>
                                <SelectItem value="depositada">Depositada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="localApreensao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local de Apreensão</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço completo da apreensão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="responsavelApreensao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável pela Apreensão</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do delegado/agente responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Observações adicionais..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Salvar
                      </Button>
                    </div>
                  </form>
                </Form>
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
              <Label>Tipo de Arma</Label>
              <Select value={filters.tipoArma} onValueChange={(value) => setFilters({...filters, tipoArma: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Pistola">Pistola</SelectItem>
                  <SelectItem value="Revólver">Revólver</SelectItem>
                  <SelectItem value="Espingarda">Espingarda</SelectItem>
                  <SelectItem value="Rifle">Rifle</SelectItem>
                  <SelectItem value="Submetralhadora">Submetralhadora</SelectItem>
                  <SelectItem value="Arma Branca">Arma Branca</SelectItem>
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
                  <SelectItem value="apreendida">Apreendida</SelectItem>
                  <SelectItem value="destruida">Destruída</SelectItem>
                  <SelectItem value="devolvida">Devolvida</SelectItem>
                  <SelectItem value="depositada">Depositada</SelectItem>
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
              <Button variant="outline" onClick={() => setFilters({ unidade: '', tipoArma: '', situacao: '', searchTerm: '' })}>
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
            <p className="text-sm text-muted-foreground">Total de Armas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredData.filter(item => item.situacao === 'apreendida').length}
            </div>
            <p className="text-sm text-muted-foreground">Apreendidas</p>
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
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma arma encontrada</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Tipo/Calibre</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Número de Série</TableHead>
                    <TableHead>Data Apreensão</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.unidade}</TableCell>
                      <TableCell>{item.tipoArma} {item.calibre}</TableCell>
                      <TableCell>{item.marca} {item.modelo}</TableCell>
                      <TableCell className="font-mono text-sm">{item.numeroSerie}</TableCell>
                      <TableCell>{new Date(item.dataApreensao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="max-w-xs truncate" title={item.localApreensao}>
                        {item.localApreensao}
                      </TableCell>
                      <TableCell>{item.responsavelApreensao}</TableCell>
                      <TableCell>{getSituacaoBadge(item.situacao)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}