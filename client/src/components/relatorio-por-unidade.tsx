import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { generatePDFReport } from "@/lib/pdf-generator";

interface RelatorioPorUnidadeProps {
  data: any[];
}

export default function RelatorioPorUnidade({ data }: RelatorioPorUnidadeProps) {
  const [selectedUnidade, setSelectedUnidade] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique unidades for filter with sorting
  const uniqueUnidades = Array.from(new Set(data.map(item => item.unidadeInspecionada)));
  
  // Custom sorting function for units (numerical DTs first, then alphabetical)
  const sortUnidades = (units: string[]) => {
    return units.sort((a, b) => {
      const aMatch = a.match(/^(\d+)ª?\s*DT/);
      const bMatch = b.match(/^(\d+)ª?\s*DT/);
      
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      } else if (aMatch) {
        return -1;
      } else if (bMatch) {
        return 1;
      } else {
        return a.localeCompare(b, 'pt-BR');
      }
    });
  };
  
  const sortedUniqueUnidades = sortUnidades(uniqueUnidades);

  // Filter data by selected unidade
  const filteredData = selectedUnidade === 'all' 
    ? data 
    : data.filter(item => item.unidadeInspecionada === selectedUnidade);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset pagination when filter changes
  const handleUnidadeChange = (value: string) => {
    setSelectedUnidade(value);
    setCurrentPage(1);
  };

  const handleGeneratePDFByUnit = () => {
    const reportData = {
      summary: {
        total: filteredData.length,
        unidade: selectedUnidade === 'all' ? 'Todas as Unidades' : selectedUnidade
      }
    };
    
    generatePDFReport('unidade', filteredData, reportData, { unidade: selectedUnidade });
  };

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Relatório por Unidade da PCBA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Selecionar Unidade:
              </label>
              <Select value={selectedUnidade} onValueChange={handleUnidadeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Unidades</SelectItem>
                  {sortedUniqueUnidades.map(unidade => (
                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGeneratePDFByUnit}
              className="bg-police-blue hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Resumo: {selectedUnidade === 'all' ? 'Todas as Unidades' : selectedUnidade}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
              <div className="text-sm text-gray-600">Total de Não Conformidades</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(item => item.providenciasConclusivas === 'Regularizado').length}
              </div>
              <div className="text-sm text-gray-600">Regularizadas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredData.filter(item => item.providenciasConclusivas === 'Em andamento').length}
              </div>
              <div className="text-sm text-gray-600">Em Andamento</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.filter(item => item.providenciasConclusivas === 'Pendente').length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detalhamento das Inspeções ({filteredData.length} registros)</span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              Página {currentPage} de {totalPages} 
              <span className="text-xs">({startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length})</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Unidade</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Data da Inspeção</TableHead>
                  <TableHead className="min-w-[150px]">Delegado Corregedor</TableHead>
                  <TableHead className="min-w-[200px]">Não Conformidades Identificadas</TableHead>
                  <TableHead className="min-w-[200px]">Providências para Regularização</TableHead>
                  <TableHead className="min-w-[150px]">Prazo para Regularização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px]">
                        <div className="font-semibold text-sm">{item.unidadeInspecionada}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.departamento}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(item.dataInspecao).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.delegadoCorregedor}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium text-sm mb-1">{item.naoConformidade}</div>
                        {item.descricaoNaoConformidade && (
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {item.descricaoNaoConformidade}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] text-xs space-y-1">
                        {item.providenciasIniciais && (
                          <div><span className="font-medium">Iniciais:</span> {item.providenciasIniciais}</div>
                        )}
                        {item.providenciasIntermediarias && (
                          <div><span className="font-medium">Intermediárias:</span> {item.providenciasIntermediarias}</div>
                        )}
                        {item.providenciasConclusivas && (
                          <div><span className="font-medium">Conclusivas:</span> {item.providenciasConclusivas}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {item.diasPrazo && (
                          <div className="font-medium">{item.diasPrazo} dias</div>
                        )}
                        {item.dataFimRegularizacao && (
                          <div className="text-xs text-gray-600">
                            Até: {new Date(item.dataFimRegularizacao).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        {item.statusPrazo && (
                          <Badge 
                            variant={
                              item.statusPrazo === 'Dentro do prazo' ? 'default' :
                              item.statusPrazo === 'Próximo do vencimento' ? 'secondary' :
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {item.statusPrazo}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma inspeção encontrada para os filtros selecionados.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
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
        </CardContent>
      </Card>
    </div>
  );
}