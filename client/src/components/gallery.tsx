import { useState } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, AlertCircle, ArrowRight, Images, Upload, FileImage, FileText, Download, Eye, Plus, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";

interface GalleryProps {
  data: any[];
  filters: any;
}

interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  inspectionId: string;
  uploadDate: Date;
  url?: string;
}

export default function Gallery({ data, filters }: GalleryProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  
  // Load files from localStorage safely
  React.useEffect(() => {
    try {
      const savedFiles = localStorage.getItem('gallery-files');
      if (savedFiles) {
        const parsed = JSON.parse(savedFiles);
        if (Array.isArray(parsed)) {
          setUploadedFiles(parsed);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos do localStorage:', error);
    }
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const itemsPerPage = 9;
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Dentro do prazo':
        return 'default';
      case 'Próximo do vencimento':
        return 'secondary';
      default:
        return 'destructive';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, inspectionId: string) => {
    const files = Array.from(event.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    
    files.forEach(file => {
      if (allowedTypes.includes(file.type)) {
        const newFile: FileUpload = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          inspectionId,
          uploadDate: new Date(),
          url: URL.createObjectURL(file)
        };
        setUploadedFiles(prev => {
          const updated = [...prev, newFile];
          // Salvar no localStorage de forma segura
          try {
            localStorage.setItem('gallery-files', JSON.stringify(updated));
          } catch (error) {
            console.error('Erro ao salvar arquivos no localStorage:', error);
          }
          return updated;
        });
      }
    });
    // Reset input
    event.target.value = '';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return FileImage;
    if (type.includes('pdf')) return FileText;
    return FileText;
  };

  const getFileColor = (type: string) => {
    if (type.includes('image')) return 'text-green-600 bg-green-50';
    if (type.includes('pdf')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Atualizar localStorage de forma segura
      try {
        localStorage.setItem('gallery-files', JSON.stringify(updated));
      } catch (error) {
        console.error('Erro ao remover arquivo do localStorage:', error);
      }
      return updated;
    });
  };

  // Get unique departments and units for filtering - with safe data handling
  const uniqueDepartments = Array.from(new Set((data || []).map(item => item?.departamento).filter(Boolean))).sort();
  const uniqueUnits = Array.from(new Set((data || []).map(item => item?.unidadeInspecionada).filter(Boolean))).sort();

  // Filter data based on search and filters - with safe data handling
  const filteredData = (data || []).filter(item => {
    if (!item) return false;
    
    const matchesSearch = searchTerm === '' || 
      (item.unidadeInspecionada && item.unidadeInspecionada.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.departamento && item.departamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.naoConformidade && item.naoConformidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.delegadoCorregedor && item.delegadoCorregedor.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === '' || item.departamento === selectedDepartment;
    const matchesUnit = selectedUnit === '' || item.unidadeInspecionada === selectedUnit;
    
    return matchesSearch && matchesDepartment && matchesUnit;
  });

  // Calculate pagination - using filtered data
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedUnit('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Images className="w-5 h-5 mr-2 text-purple-600" />
              Galeria de Inspeções ({totalItems} de {(data || []).length} registros)
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {totalPages > 1 && (
                <>
                  Página {currentPage} de {totalPages} 
                  <span className="text-xs">({startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems})</span>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar por unidade, departamento, não conformidade..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Select value={selectedDepartment} onValueChange={(value) => {
                  setSelectedDepartment(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {uniqueDepartments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select value={selectedUnit} onValueChange={(value) => {
                  setSelectedUnit(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {uniqueUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchTerm || selectedDepartment || selectedUnit) && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </Button>
                <span className="text-sm text-gray-600">
                  {totalItems} resultado{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {totalItems === 0 ? (
            <div className="text-center py-12">
              <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {(data || []).length === 0 ? "Nenhuma inspeção encontrada" : "Nenhuma inspeção corresponde aos filtros aplicados"}
              </p>
              {(searchTerm || selectedDepartment || selectedUnit) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((inspection) => {
                const inspectionFiles = uploadedFiles.filter(f => f.inspectionId === inspection.id);
                return (
                <Card key={inspection.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                  <div className="aspect-video bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center relative">
                    {inspectionFiles.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 w-full h-full p-4">
                        {inspectionFiles.slice(0, 4).map((file) => {
                          const Icon = getFileIcon(file.type);
                          return (
                            <div key={file.id} className={`rounded-lg flex items-center justify-center ${getFileColor(file.type)} relative group cursor-pointer`}>
                              <Icon className="w-6 h-6" />
                              {file.type.includes('image') && file.url && (
                                <img src={file.url} alt={file.name} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-80 hover:opacity-100 transition-opacity" />
                              )}
                              {/* Botão remover */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.id);
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs font-bold shadow-lg z-10"
                                title={`Remover ${file.name}`}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                        {inspectionFiles.length > 4 && (
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm font-medium">
                            +{inspectionFiles.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Images className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm font-medium">Inspeção #{inspection.numero}</p>
                        <p className="text-xs">Sem arquivos</p>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                      {inspection.unidadeInspecionada}
                    </h4>
                    
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(inspection.dataInspecao).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <p className="text-sm text-gray-600 flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                        <span className="line-clamp-2">{inspection.naoConformidade}</span>
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={getStatusVariant(inspection.statusPrazo)} className="text-xs">
                        {inspection.statusPrazo}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {inspection.departamento}
                      </Badge>
                      {inspectionFiles.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          {inspectionFiles.length} arquivo{inspectionFiles.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md">
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                        {inspectionFiles.length > 0 && (
                          <Button size="sm" variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-300 text-green-700">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => handleFileUpload(e, inspection.id)}
                            className="hidden"
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700"
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
                              input?.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Anexar
                          </Button>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} inspeções
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-300 text-purple-700"
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
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
                            : 'bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-300 text-purple-700'
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
                  className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-300 text-purple-700"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files Summary */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Arquivos Anexados ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => {
                const Icon = getFileIcon(file.type);
                const inspection = data.find(i => i.id === file.inspectionId);
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded ${getFileColor(file.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {inspection?.unidadeInspecionada || 'Inspeção não encontrada'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB • {file.uploadDate.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {file.url && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(file.url, '_blank')}
                          className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {file.url && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = file.url!;
                            a.download = file.name;
                            a.click();
                          }}
                          className="h-8 w-8 p-0 hover:bg-green-100 text-green-600"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
