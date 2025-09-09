import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Images, Upload, X, ChevronLeft, ChevronRight, Search, Maximize2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GalleryProps {
  data: any[];
  filters: any;
}

interface GalleryPhoto {
  id: number;
  unidade: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  imageData: string;
  createdAt: string;
}

export default function Gallery({ data = [], filters }: GalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<GalleryPhoto | null>(null);
  const itemsPerPage = 9;
  const queryClient = useQueryClient();

  // Buscar fotos do banco de dados
  const { data: photos = [], isLoading: photosLoading } = useQuery({
    queryKey: ['/api/gallery/photos'],
    refetchOnWindowFocus: false,
  });

  // Mutation para salvar foto
  const savePhotoMutation = useMutation({
    mutationFn: async (photoData: {
      unidade: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      imageData: string;
    }) => {
      const response = await apiRequest('/api/gallery/photos', 'POST', photoData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/photos'] });
    },
    onError: (error) => {
      console.error('Erro ao salvar foto:', error);
      alert('Erro ao salvar foto. Tente novamente.');
    },
  });

  // Mutation para deletar foto
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await apiRequest(`/api/gallery/photos/${photoId}`, 'DELETE');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/photos'] });
    },
    onError: (error) => {
      console.error('Erro ao deletar foto:', error);
      alert('Erro ao deletar foto. Tente novamente.');
    },
  });

  // Comprimir e converter arquivo para base64
  const compressAndConvertFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Definir tamanho máximo para compressão
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Calcular nova dimensão mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com qualidade reduzida
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        console.log('Imagem comprimida:', file.name, 'tamanho original:', file.size, 'tamanho base64:', compressedBase64.length);
        resolve(compressedBase64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de arquivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, unidade: string) => {
    console.log('handleFileUpload chamado para unidade:', unidade);
    
    const files = Array.from(event.target.files || []);
    console.log('Arquivos selecionados:', files.length);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    for (const file of files) {
      console.log('Processando arquivo:', file.name, 'tipo:', file.type, 'tamanho:', file.size);
      
      if (allowedTypes.includes(file.type)) {
        try {
          const base64Url = await compressAndConvertFile(file);
          console.log('Base64 comprimido gerado para:', file.name, 'tamanho base64:', base64Url.length);
          
          // Salvar no banco de dados
          await savePhotoMutation.mutateAsync({
            unidade,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            imageData: base64Url
          });
          
          console.log('Foto salva no banco:', file.name);
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          alert(`Erro ao salvar ${file.name}. Tente novamente.`);
        }
      } else {
        console.warn('Tipo de arquivo não permitido:', file.type);
        alert('Apenas arquivos JPG, JPEG e PNG são permitidos.');
      }
    }
    
    event.target.value = '';
  };

  // Remover arquivo
  const removeFile = async (photoId: number) => {
    if (confirm('Tem certeza que deseja remover esta foto?')) {
      try {
        await deletePhotoMutation.mutateAsync(photoId);
      } catch (error) {
        console.error('Erro ao remover foto:', error);
      }
    }
  };

  // Dados seguros
  const safeData = Array.isArray(data) ? data : [];
  
  // Agrupar por unidade (apenas um card por unidade)
  const unitMap = new Map();
  safeData.forEach(item => {
    if (!item || !item.unidadeInspecionada) return;
    
    if (!unitMap.has(item.unidadeInspecionada)) {
      unitMap.set(item.unidadeInspecionada, {
        ...item,
        totalInspections: 1,
        allInspections: [item]
      });
    } else {
      const existing = unitMap.get(item.unidadeInspecionada);
      existing.totalInspections += 1;
      existing.allInspections.push(item);
      // Manter a inspeção mais recente como representativa
      if (new Date(item.dataInspecao) > new Date(existing.dataInspecao)) {
        Object.assign(existing, item);
        existing.totalInspections = existing.allInspections.length;
      }
    }
  });

  // Converter para array e filtrar
  const uniqueUnits = Array.from(unitMap.values());
  
  const filteredData = uniqueUnits.filter(item => {
    if (!item) return false;
    
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.unidadeInspecionada && item.unidadeInspecionada.toLowerCase().includes(searchLower)) ||
      (item.departamento && item.departamento.toLowerCase().includes(searchLower)) ||
      (item.naoConformidade && item.naoConformidade.toLowerCase().includes(searchLower)) ||
      (item.numero && item.numero.toString().includes(searchTerm))
    );
  });

  // Paginação
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset página quando busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Images className="w-5 h-5 mr-2 text-purple-600" />
              Galeria de Unidades PCBA ({totalItems} de {uniqueUnits.length} unidades)
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} • Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Busca melhorada */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar unidades da PCBA por nome, departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="mt-2 flex items-center gap-2">
                <Button onClick={() => setSearchTerm('')} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Limpar busca
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
                {searchTerm ? "Nenhuma unidade encontrada para sua busca" : "Nenhuma unidade encontrada"}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Tente buscar por: nome da unidade ou departamento
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.map((inspection) => {
                const inspectionFiles = uploadedFiles.filter(f => f.inspectionId === inspection.id);
                return (
                  <Card key={inspection.id} className="border-2 hover:border-purple-200 transition-all">
                    <div className="min-h-[200px] bg-gradient-to-br from-purple-50 to-blue-50 rounded-t-lg flex items-center justify-center relative">
                      {inspectionFiles.length > 0 ? (
                        <div className={`grid gap-1 w-full h-full p-2 ${
                          inspectionFiles.length === 1 ? 'grid-cols-1' :
                          inspectionFiles.length === 2 ? 'grid-cols-2' :
                          inspectionFiles.length <= 4 ? 'grid-cols-2' :
                          inspectionFiles.length <= 9 ? 'grid-cols-3' :
                          'grid-cols-4'
                        }`}>
                          {inspectionFiles.map((file) => (
                            <div key={file.id} className="relative group overflow-hidden rounded">
                              <div className="aspect-square bg-gray-100 overflow-hidden rounded">
                                <img 
                                  src={file.url} 
                                  alt={file.name} 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                                  onClick={() => setSelectedImage(file)}
                                />

                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.id);
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10"
                                title="Remover foto"
                              >
                                ×
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImage(file);
                                }}
                                className="absolute bottom-1 right-1 w-5 h-5 bg-black bg-opacity-50 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Ampliar foto"
                              >
                                <Maximize2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Images className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">{inspection.unidadeInspecionada}</p>
                          <p className="text-xs">Sem fotos</p>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {inspection.unidadeInspecionada}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-1">
                        {inspection.departamento}
                      </p>
                      
                      <p className="text-xs text-gray-500 mb-3">
                        {inspection.totalInspections} inspeções • Última: {new Date(inspection.dataInspecao).toLocaleDateString('pt-BR')}
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, inspection.id)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id={`upload-${inspection.id}`}
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Button clicked, triggering file input for:', inspection.id);
                              const fileInput = document.getElementById(`upload-${inspection.id}`) as HTMLInputElement;
                              if (fileInput) {
                                fileInput.click();
                                console.log('File input clicked');
                              } else {
                                console.error('File input not found');
                              }
                            }}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload JPG/PNG
                          </Button>
                        </div>
                        
                        {inspectionFiles.length > 0 && (
                          <p className="text-xs text-center text-gray-500">
                            {inspectionFiles.length} foto{inspectionFiles.length > 1 ? 's' : ''} anexada{inspectionFiles.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Modal de ampliação da imagem */}
          <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedImage?.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedImage && removeFile(selectedImage.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </DialogTitle>
              </DialogHeader>
              {selectedImage && (
                <div className="flex justify-center">
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.name}
                    className="max-w-full max-h-[70vh] object-contain rounded"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {currentPage > 3 && (
                  <>
                    <Button
                      onClick={() => setCurrentPage(1)}
                      variant="outline"
                      size="sm"
                      className="w-10"
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="text-sm text-gray-500">...</span>}
                  </>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                }).filter(Boolean)}
                
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-sm text-gray-500">...</span>}
                    <Button
                      onClick={() => setCurrentPage(totalPages)}
                      variant="outline"
                      size="sm"
                      className="w-10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}