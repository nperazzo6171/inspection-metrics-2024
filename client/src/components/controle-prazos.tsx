import { useState, useMemo, useEffect } from "react";
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
import { Clock, FileText, Plus, ChevronLeft, ChevronRight, Filter, CheckCircle, XCircle, Edit, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Schema for form validation
const controlePrazoSchema = z.object({
  unidade: z.string().min(1, "Unidade é obrigatória"),
  oficio: z.string().min(1, "Ofício é obrigatório"),
  linkSei: z.string().optional(),
  linkCoda: z.string().optional(),
  naoConformidade: z.string().min(1, "Não conformidade é obrigatória"),
  dataRecebimento: z.string().min(1, "Data de recebimento é obrigatória"),
  dataPrazo: z.string().min(1, "Data prazo é obrigatória"),
  status: z.enum(["pendente", "regularizado", "nao_regularizado"]),
  observacoes: z.string().optional(),
});

type ControlePrazoForm = z.infer<typeof controlePrazoSchema>;

export default function StatusRegularizacao() {
  const [filters, setFilters] = useState({
    unidade: '',
    status: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para calcular dias restantes automaticamente
  const calculateDaysRemaining = (dataPrazo: string) => {
    if (!dataPrazo) return 0;
    
    try {
      const today = new Date();
      let deadline;
      
      // Verificar se é uma data ISO (formato YYYY-MM-DD) ou timestamp
      if (dataPrazo.includes('-') && dataPrazo.length === 10) {
        // Formato YYYY-MM-DD, precisa adicionar timezone local
        deadline = new Date(dataPrazo + 'T00:00:00');
      } else {
        // Outros formatos ou timestamps
        deadline = new Date(dataPrazo);
      }
      
      // Zerar horários para comparação apenas de datas
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      
      const timeDiff = deadline.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return daysDiff;
    } catch (error) {
      console.error('Erro ao calcular dias restantes:', error);
      return 0;
    }
  };

  // Get control records with auto-refresh for real-time countdown
  const { data: controlePrazos = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/controle-prazos'],
    refetchInterval: 60000, // Atualiza a cada 1 minuto para mostrar contagem regressiva
  });

  // Force re-render every minute to update countdown display
  const [, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, []);

  // Get unique units from controle de prazos data ONLY
  const uniqueUnidades = Array.from(new Set(controlePrazos.map((item: any) => item.unidade))).sort();

  // Form setup
  const form = useForm<ControlePrazoForm>({
    resolver: zodResolver(controlePrazoSchema),
    defaultValues: {
      unidade: "",
      oficio: "",
      linkSei: "",
      linkCoda: "",
      naoConformidade: "",
      dataRecebimento: "",
      dataPrazo: "",
      status: "pendente",
      observacoes: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ControlePrazoForm) => {
      const response = await apiRequest('/api/controle-prazos', 'POST', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/controle-prazos'] });
      toast({ title: "Registro criado com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast({ 
        title: "Erro ao criar registro", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update mutation - para edição completa do registro
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ControlePrazoForm }) => {
      console.log(`Updating controle-prazo ${id} with data:`, data);
      const response = await apiRequest(`/api/controle-prazos/${id}`, 'PATCH', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/controle-prazos'] });
      toast({ title: "Registro atualizado com sucesso!" });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({ 
        title: "Erro ao atualizar registro", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Status update mutation - para mudanças rápidas de status
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      console.log(`Updating status of controle-prazo ${id} to ${status}`);
      const response = await apiRequest(`/api/controle-prazos/${id}`, 'PATCH', { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/controle-prazos'] });
      toast({ title: "Status atualizado com sucesso!" });
    },
    onError: (error) => {
      console.error('Status update error:', error);
      toast({ 
        title: "Erro ao atualizar status", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Apply filters
  const filteredData = controlePrazos.filter((item: any) => {
    const matchesUnidade = !filters.unidade || item.unidade === filters.unidade;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.oficio.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.naoConformidade.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesStatus && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'regularizado':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Regularizado</Badge>;
      case 'nao_regularizado':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Não Regularizado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const getDaysRemaining = (dataPrazo: string, status: string) => {
    // Se já foi regularizado, não exibir dias restantes
    if (status === 'regularizado') {
      return <span className="text-green-600 font-medium">✓ Regularizado</span>;
    }
    
    // Se não foi regularizado, não exibir dias restantes
    if (status === 'nao_regularizado') {
      return <span className="text-red-600 font-medium">✗ Não Regularizado</span>;
    }
    
    // Se não tem data prazo definida
    if (!dataPrazo || dataPrazo === 'Não definida') {
      return <span className="text-gray-500 font-medium">Não definida</span>;
    }
    
    // Para status pendente com data prazo, calcular normalmente
    const diffDays = calculateDaysRemaining(dataPrazo);
    
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">{Math.abs(diffDays)} dias em atraso</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-medium">{diffDays} dias restantes</span>;
    } else {
      return <span className="text-green-600 font-medium">Dentro do prazo</span>;
    }
  };

  const updateStatus = (id: number, newStatus: "pendente" | "regularizado" | "nao_regularizado") => {
    statusUpdateMutation.mutate({ id, status: newStatus });
  };

  const generatePDF = async () => {
    try {
      console.log('Iniciando geração de PDF...');
      console.log('Dados filtrados:', filteredData);
      
      if (!filteredData || filteredData.length === 0) {
        toast({ 
          title: "Erro ao gerar PDF", 
          description: "Nenhum dado encontrado para gerar o relatório",
          variant: "destructive" 
        });
        return;
      }

      // Dynamic import as fallback
      let jsPDF;
      try {
        // Try global first
        if (typeof (window as any).jspdf !== 'undefined') {
          jsPDF = (window as any).jspdf.jsPDF;
        } else if (typeof (window as any).jsPDF !== 'undefined') {
          jsPDF = (window as any).jsPDF;
        } else {
          // Fallback to dynamic import
          const jsPDFModule = await import('jspdf');
          jsPDF = jsPDFModule.default;
        }
      } catch (importError) {
        console.error('Error importing jsPDF:', importError);
        toast({ 
          title: "Erro ao carregar PDF", 
          description: "Biblioteca de PDF não está disponível",
          variant: "destructive" 
        });
        return;
      }

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text('Relatório de Controle de Prazos de Regularização', 20, 20);
      
      // Subtitle
      doc.setFontSize(12);
      doc.text('Polícia Civil do Estado da Bahia - ASTEC/CORREPOL', 20, 30);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
      
      // Summary
      const pendentes = filteredData.filter((item: any) => item.status === 'pendente').length;
      const regularizados = filteredData.filter((item: any) => item.status === 'regularizado').length;
      const naoRegularizados = filteredData.filter((item: any) => item.status === 'nao_regularizado').length;
      
      doc.text(`Total de registros: ${filteredData.length}`, 20, 55);
      doc.text(`Pendentes: ${pendentes} | Regularizados: ${regularizados} | Não Regularizados: ${naoRegularizados}`, 20, 65);
      
      // Simple text-based report
      let yPos = 85;
      doc.setFontSize(10);
      
      filteredData.forEach((item: any, index: number) => {
        if (yPos > 270) { // New page if needed
          doc.addPage();
          yPos = 20;
        }
        
        const formatDate = (dateStr: string) => {
          try {
            if (!dateStr) return 'N/A';
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR');
          } catch {
            return 'Data inválida';
          }
        };
        
        const statusText = item.status === 'regularizado' ? 'Regularizado' : 
                          item.status === 'nao_regularizado' ? 'Não Regularizado' : 'Pendente';
        
        doc.text(`${index + 1}. ${item.unidade}`, 20, yPos);
        doc.text(`   Ofício: ${item.oficio}`, 20, yPos + 5);
        doc.text(`   NC: ${(item.naoConformidade || '').substring(0, 60)}`, 20, yPos + 10);
        doc.text(`   Recebimento: ${formatDate(item.dataRecebimento)} | Prazo: ${formatDate(item.dataPrazo)}`, 20, yPos + 15);
        doc.text(`   Status: ${statusText}`, 20, yPos + 20);
        
        yPos += 30;
      });
      
      const fileName = `controle-prazos-regularizacao-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({ 
        title: "PDF gerado com sucesso!", 
        description: `Relatório ${fileName} foi baixado`
      });
      
      console.log('PDF gerado com sucesso:', fileName);
      
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      toast({ 
        title: "Erro ao gerar PDF", 
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive" 
      });
    }
  };

  const onSubmit = (data: ControlePrazoForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    form.reset({
      unidade: item.unidade,
      oficio: item.oficio,
      linkSei: item.linkSei || '',
      linkCoda: item.linkCoda || '',
      naoConformidade: item.naoConformidade,
      dataRecebimento: item.dataRecebimento,
      dataPrazo: item.dataPrazo,
      status: item.status,
      observacoes: item.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset();
  };

  const clearFilters = () => {
    setFilters({ unidade: '', status: '', searchTerm: '' });
    setCurrentPage(1);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Controle de Prazos de Regularização
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-police-blue hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Registro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Controle de Prazo' : 'Novo Controle de Prazo'}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="unidade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a unidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {uniqueUnidades.map((unidade) => (
                                  <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="oficio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ofício</FormLabel>
                            <FormControl>
                              <Input placeholder="Número do ofício" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="linkSei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link SEI (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://sei.ba.gov.br/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkCoda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link SICORQ (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://sicorq..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="naoConformidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Não Conformidade</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição da não conformidade..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dataRecebimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Recebimento</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dataPrazo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Prazo</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações (opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Observações adicionais..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {(createMutation.isPending || updateMutation.isPending) ? "Salvando..." : "Salvar"}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Unidade</Label>
              <Select value={filters.unidade} onValueChange={(value) => setFilters({...filters, unidade: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {uniqueUnidades.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="regularizado">Regularizado</SelectItem>
                  <SelectItem value="nao_regularizado">Não Regularizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Buscar</Label>
              <Input 
                placeholder="Buscar por unidade, ofício..." 
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
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
            <p className="text-sm text-muted-foreground">Total de Registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredData.filter((item: any) => item.status === 'pendente').length}
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredData.filter((item: any) => item.status === 'regularizado').length}
            </div>
            <p className="text-sm text-muted-foreground">Regularizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredData.filter((item: any) => item.status === 'nao_regularizado').length}
            </div>
            <p className="text-sm text-muted-foreground">Não Regularizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent>
          {paginatedData.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum registro encontrado</p>
              <p className="text-sm text-gray-400">Crie um novo registro ou ajuste os filtros</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Ofício</TableHead>
                    <TableHead>Não Conformidade</TableHead>
                    <TableHead>Recebimento</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Dias Restantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.unidade}</TableCell>
                      <TableCell>{item.oficio}</TableCell>
                      <TableCell className="max-w-md break-words whitespace-normal">{item.naoConformidade}</TableCell>
                      <TableCell>{new Date(item.dataRecebimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{new Date(item.dataPrazo).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getDaysRemaining(item.dataPrazo, item.status)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.linkSei ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              onClick={() => window.open(item.linkSei, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              SEI
                            </Button>
                          ) : null}
                          {item.linkCoda ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 px-2 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                              onClick={() => window.open(item.linkCoda, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              SICORQ
                            </Button>
                          ) : null}
                          {!item.linkSei && !item.linkCoda && (
                            <span className="text-gray-400 text-xs">Sem link</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="h-8 px-2"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {item.status !== 'regularizado' && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(item.id, 'regularizado')}
                              className="bg-green-600 hover:bg-green-700 h-8 px-2"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          {item.status !== 'nao_regularizado' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(item.id, 'nao_regularizado')}
                              className="h-8 px-2"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          )}
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