import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Scale, FileText, Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Document {
  id: number;
  tipo: 'Lei' | 'Instrução Normativa' | 'Portaria' | 'Ofício Circular' | 'Nota Técnica' | 'Termo de Cooperação Técnica';
  numero: string;
  ano: string;
  titulo: string;
  descricao?: string;
  orgaoEmissor?: string;
  dataPublicacao?: string;
  dataVigencia?: string;
  status: 'Vigente' | 'Revogado' | 'Suspenso';
  assunto?: string;
  arquivoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NormalizacaoDocsProps {
  data?: Document[];
}

export default function NormalizacaoDocs({ data = [] }: NormalizacaoDocsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get documents from API
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const itemsPerPage = 10;

  const [newDoc, setNewDoc] = useState<Partial<Document>>({
    tipo: 'Lei',
    numero: '',
    ano: new Date().getFullYear().toString(),
    titulo: '',
    descricao: '',
    orgaoEmissor: '',
    dataPublicacao: '',
    dataVigencia: '',
    status: 'Vigente',
    assunto: ''
  });

  const documentTypes = [
    'Lei',
    'Instrução Normativa', 
    'Portaria',
    'Ofício Circular',
    'Nota Técnica',
    'Termo de Cooperação Técnica'
  ];

  const statusOptions = ['Vigente', 'Revogado', 'Suspenso'];

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.descricao || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || filterType === 'all-types' || doc.tipo === filterType;
    const matchesStatus = !filterStatus || filterStatus === 'all-status' || doc.status === filterStatus;
    const matchesYear = !filterYear || filterYear === 'all-years' || doc.ano === filterYear;
    
    return matchesSearch && matchesType && matchesStatus && matchesYear;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  // Mutations for API calls
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return await apiRequest('/api/documents', 'POST', documentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Sucesso",
        description: "Documento criado com sucesso!",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, ...documentData }: any) => {
      return await apiRequest(`/api/documents/${id}`, 'PUT', documentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Sucesso",
        description: "Documento atualizado com sucesso!",
      });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewDoc({
      tipo: 'Lei',
      numero: '',
      ano: new Date().getFullYear().toString(),
      titulo: '',
      descricao: '',
      orgaoEmissor: '',
      dataPublicacao: '',
      dataVigencia: '',
      status: 'Vigente',
      assunto: ''
    });
    setEditingDoc(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Note: File upload not implemented yet - would need file upload endpoint
      setNewDoc(prev => ({
        ...prev,
        arquivoUrl: file.name // Placeholder
      }));
    }
  };

  const handleSaveDocument = () => {
    if (newDoc.titulo && newDoc.numero && newDoc.tipo) {
      const documentData = {
        tipo: newDoc.tipo,
        numero: newDoc.numero,
        ano: newDoc.ano,
        titulo: newDoc.titulo,
        descricao: newDoc.descricao,
        orgaoEmissor: newDoc.orgaoEmissor,
        dataPublicacao: newDoc.dataPublicacao,
        dataVigencia: newDoc.dataVigencia,
        status: newDoc.status,
        assunto: newDoc.assunto,
        arquivoUrl: newDoc.arquivoUrl
      };

      if (editingDoc) {
        updateDocumentMutation.mutate({ id: editingDoc.id, ...documentData });
      } else {
        createDocumentMutation.mutate(documentData);
      }
    } else {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios: Tipo, Número e Título.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setNewDoc(doc);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteDocumentMutation.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vigente': return 'bg-green-100 text-green-800';
      case 'Revogado': return 'bg-red-100 text-red-800';
      case 'Suspenso': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Lei': return 'bg-blue-100 text-blue-800';
      case 'Instrução Normativa': return 'bg-purple-100 text-purple-800';
      case 'Portaria': return 'bg-orange-100 text-orange-800';
      case 'Ofício Circular': return 'bg-teal-100 text-teal-800';
      case 'Nota Técnica': return 'bg-indigo-100 text-indigo-800';
      case 'Termo de Cooperação Técnica': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique years for filter
  const availableYears = Array.from(new Set(documents.map(doc => doc.ano))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Scale className="w-5 h-5 mr-2 text-blue-600" />
              Normatização Legal e Técnica ({filteredDocs.length} documentos)
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDoc ? 'Editar Documento' : 'Adicionar Novo Documento'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div>
                    <Label>Tipo de Documento</Label>
                    <Select value={newDoc.tipo} onValueChange={(value) => setNewDoc(prev => ({...prev, tipo: value as Document['tipo']}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={newDoc.numero}
                      onChange={(e) => setNewDoc(prev => ({...prev, numero: e.target.value}))}
                      placeholder="Ex: 123/2024"
                    />
                  </div>
                  <div>
                    <Label>Ano</Label>
                    <Input
                      value={newDoc.ano}
                      onChange={(e) => setNewDoc(prev => ({...prev, ano: e.target.value}))}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={newDoc.status} onValueChange={(value) => setNewDoc(prev => ({...prev, status: value as Document['status']}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Título</Label>
                    <Input
                      value={newDoc.titulo}
                      onChange={(e) => setNewDoc(prev => ({...prev, titulo: e.target.value}))}
                      placeholder="Título do documento"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descrição/Ementa</Label>
                    <Textarea
                      value={newDoc.descricao}
                      onChange={(e) => setNewDoc(prev => ({...prev, descricao: e.target.value}))}
                      placeholder="Descrição detalhada do documento"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Órgão Emissor</Label>
                    <Input
                      value={newDoc.orgaoEmissor}
                      onChange={(e) => setNewDoc(prev => ({...prev, orgaoEmissor: e.target.value}))}
                      placeholder="Ex: Secretaria de Segurança Pública"
                    />
                  </div>
                  <div>
                    <Label>Assunto</Label>
                    <Input
                      value={newDoc.assunto}
                      onChange={(e) => setNewDoc(prev => ({...prev, assunto: e.target.value}))}
                      placeholder="Assunto principal"
                    />
                  </div>
                  <div>
                    <Label>Data de Publicação</Label>
                    <Input
                      type="date"
                      value={newDoc.dataPublicacao}
                      onChange={(e) => setNewDoc(prev => ({...prev, dataPublicacao: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label>Data de Vigência</Label>
                    <Input
                      type="date"
                      value={newDoc.dataVigencia}
                      onChange={(e) => setNewDoc(prev => ({...prev, dataVigencia: e.target.value}))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Arquivo (PDF)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveDocument}
                    disabled={createDocumentMutation.isPending || updateDocumentMutation.isPending}
                  >
                    {(createDocumentMutation.isPending || updateDocumentMutation.isPending) ? (
                      'Salvando...'
                    ) : (
                      editingDoc ? 'Atualizar' : 'Salvar'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Pesquisar</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Título, número ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Todos os tipos</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">Todos os status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ano</Label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">Todos os anos</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all-types');
                  setFilterStatus('all-status');
                  setFilterYear('all-years');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Documentos ({filteredDocs.length} encontrados)
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredDocs.length)} de {filteredDocs.length})
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum documento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número/Ano</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Órgão Emissor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Publicação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocs.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge className={`text-xs ${getTypeColor(doc.tipo)}`}>
                          {doc.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {doc.numero}/{doc.ano}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={doc.titulo}>
                          {doc.titulo}
                        </div>
                        {doc.assunto && (
                          <div className="text-xs text-gray-500 truncate">
                            {doc.assunto}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {doc.orgaoEmissor || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {doc.dataPublicacao ? 
                          new Date(doc.dataPublicacao).toLocaleDateString('pt-BR') : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {doc.arquivoUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(doc.arquivoUrl, '_blank')}
                              className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {doc.arquivoUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = doc.arquivoUrl!;
                                a.download = `${doc.tipo}_${doc.numero}_${doc.ano}.pdf`;
                                a.click();
                              }}
                              className="h-8 w-8 p-0 hover:bg-green-100 text-green-600"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(doc)}
                            className="h-8 w-8 p-0 hover:bg-yellow-100 text-yellow-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(doc.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDocs.length)} de {filteredDocs.length} documentos
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 p-0 ${
                              currentPage === pageNum 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                                : 'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700'
                            }`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}