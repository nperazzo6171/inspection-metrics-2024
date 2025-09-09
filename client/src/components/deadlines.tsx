import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, FileText, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-generator";

interface DeadlinesProps {
  data: any[];
}

export default function Deadlines({ data }: DeadlinesProps) {
  const [filters, setFilters] = useState({
    unidade: '',
    status: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get controle de prazos data
  const { data: controlePrazos = [] } = useQuery<any[]>({
    queryKey: ['/api/controle-prazos'],
  });

  // Function to calculate days remaining
  const calculateDaysRemaining = (dataPrazo: string) => {
    if (!dataPrazo) return 0;
    
    try {
      const today = new Date();
      let deadline;
      
      if (dataPrazo.includes('-') && dataPrazo.length === 10) {
        deadline = new Date(dataPrazo + 'T00:00:00');
      } else {
        deadline = new Date(dataPrazo);
      }
      
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

  // Apply filters to controle de prazos data
  const filteredData = controlePrazos.filter(item => {
    const matchesUnidade = !filters.unidade || item.unidade === filters.unidade;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
      item.unidade.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      item.naoConformidade.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesUnidade && matchesStatus && matchesSearch;
  });

  const processedData = filteredData.map(item => {
    const remainingDays = calculateDaysRemaining(item.dataPrazo);
    
    return {
      ...item,
      diasRestantes: remainingDays,
      statusClass: item.status === 'regularizado' ? 'default' :
                   item.status === 'nao_regularizado' ? 'destructive' :
                   remainingDays > 7 ? 'default' : 
                   remainingDays > 0 ? 'secondary' : 
                   'destructive'
    };
  });

  // Get unique values for filter dropdowns
  const uniqueUnidades = Array.from(new Set(controlePrazos.map(item => item.unidade))).sort();
  
  const clearFilters = () => {
    setFilters({ unidade: '', status: '', searchTerm: '' });
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = processedData.slice(startIndex, endIndex);

  const handleGenerateReport = () => {
    generatePDFReport('deadlines', processedData);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Acompanhamento de Prazos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Unidade</Label>
              <Select value={filters.unidade || 'all'} onValueChange={(value) => setFilters({...filters, unidade: value === 'all' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {uniqueUnidades.map(unidade => (
                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({...filters, status: value === 'all' ? '' : value})}>
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
              <Label>Busca Geral</Label>
              <Input 
                placeholder="Buscar..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Acompanhamento de Prazos ({processedData.length} registros de controle)
            </div>
            <div className="flex items-center gap-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  Página {currentPage} de {totalPages} 
                  <span className="text-xs">({startIndex + 1}-{Math.min(endIndex, processedData.length)} de {processedData.length})</span>
                </div>
              )}
              <Button onClick={handleGenerateReport} className="bg-police-blue hover:bg-blue-700">
                <FileText className="w-4 h-4 mr-2" />
                Relatório de Prazos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {controlePrazos.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum prazo encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Ofício</TableHead>
                    <TableHead>Não Conformidade</TableHead>
                    <TableHead>Data Prazo</TableHead>
                    <TableHead>Dias Restantes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {item.unidade}
                      </TableCell>
                      <TableCell>
                        {item.oficio}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={item.naoConformidade}>
                          {item.naoConformidade}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.dataPrazo ? 
                          new Date(item.dataPrazo).toLocaleDateString('pt-BR') : 
                          'Não definida'
                        }
                      </TableCell>
                      <TableCell>
                        {item.status === 'regularizado' ? (
                          <span className="text-green-600 font-medium">✓ Regularizado</span>
                        ) : item.status === 'nao_regularizado' ? (
                          <span className="text-red-600 font-medium">✗ Não Regularizado</span>
                        ) : !item.dataPrazo ? (
                          <span className="text-gray-500 font-medium">Não definida</span>
                        ) : (
                          item.diasRestantes > 0 
                            ? `${item.diasRestantes} dias` 
                            : `${Math.abs(item.diasRestantes)} dias em atraso`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.statusClass}>
                          {item.status === 'pendente' ? 'Pendente' :
                           item.status === 'regularizado' ? 'Regularizado' :
                           'Não Regularizado'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, processedData.length)} de {processedData.length} registros
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
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
                            className="w-8 h-8 p-0"
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
