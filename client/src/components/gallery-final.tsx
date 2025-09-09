import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Images, Upload, Search, Trash2, Calendar, MapPin, Filter, Camera } from "lucide-react";

interface GalleryFinalProps {
  data: any[];
  filters: any;
}

interface Photo {
  id: number;
  unidade: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  imageData: string;
  createdAt: string;
}

export default function GalleryFinal({ data = [] }: GalleryFinalProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingUnit, setUploadingUnit] = useState('');
  const itemsPerPage = 6;

  // Query para buscar fotos
  const { data: photos = [], isLoading, refetch } = useQuery<Photo[]>({
    queryKey: ['/api/gallery/photos'],
    refetchOnWindowFocus: false,
  });

  // Mutation para upload
  const uploadMutation = useMutation({
    mutationFn: async ({ file, unidade }: { file: File; unidade: string }) => {
      // Comprimir imagem
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      canvas.width = 800;
      canvas.height = 600;
      ctx?.drawImage(img, 0, 0, 800, 600);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.7);

      const response = await fetch('/api/gallery/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unidade,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          imageData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/photos'] });
      setIsUploading(false);
      setUploadingUnit('');
    },
    onError: (error) => {
      console.error('Erro no upload:', error);
      setIsUploading(false);
      setUploadingUnit('');
      alert(`Erro no upload: ${error.message}`);
    }
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (photoId: number) => {
      const response = await fetch(`/api/gallery/photos/${photoId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar foto');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery/photos'] });
    }
  });

  // Agrupar fotos por unidade
  const photosByUnit = useMemo(() => {
    const grouped = photos.reduce((acc, photo) => {
      if (!acc[photo.unidade]) {
        acc[photo.unidade] = [];
      }
      acc[photo.unidade].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);
    return grouped;
  }, [photos]);

  // Criar dados das unidades com contadores
  const unitsData = useMemo(() => {
    const unitsMap = new Map();

    // Adicionar todas as unidades dos dados de inspeção
    data.forEach((item: any) => {
      const unidade = item.unidadeInspecionada;
      if (!unitsMap.has(unidade)) {
        unitsMap.set(unidade, {
          unidade,
          departamento: item.departamento,
          totalInspecoes: 0,
          ultimaInspecao: null,
          fotos: photosByUnit[unidade] || []
        });
      }
      
      const unit = unitsMap.get(unidade);
      unit.totalInspecoes++;
      
      if (item.dataInspecao && (!unit.ultimaInspecao || new Date(item.dataInspecao) > new Date(unit.ultimaInspecao))) {
        unit.ultimaInspecao = item.dataInspecao;
      }
    });

    // Adicionar unidades que só têm fotos
    Object.keys(photosByUnit).forEach(unidade => {
      if (!unitsMap.has(unidade)) {
        unitsMap.set(unidade, {
          unidade,
          departamento: 'Não informado',
          totalInspecoes: 0,
          ultimaInspecao: null,
          fotos: photosByUnit[unidade] || []
        });
      } else {
        unitsMap.get(unidade).fotos = photosByUnit[unidade] || [];
      }
    });

    return Array.from(unitsMap.values());
  }, [data, photosByUnit]);

  // Filtrar dados
  const filteredUnits = useMemo(() => {
    return unitsData.filter(unit => {
      const matchesSearch = !searchTerm || 
        unit.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.departamento.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || unit.departamento === selectedDepartment;
      const matchesUnit = !selectedUnit || unit.unidade === selectedUnit;
      
      return matchesSearch && matchesDepartment && matchesUnit;
    });
  }, [unitsData, searchTerm, selectedDepartment, selectedUnit]);

  // Paginação
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const currentUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Departamentos únicos
  const departments = useMemo(() => {
    return Array.from(new Set(unitsData.map(unit => unit.departamento))).sort();
  }, [unitsData]);

  // Unidades únicas
  const units = useMemo(() => {
    return Array.from(new Set(unitsData.map(unit => unit.unidade))).sort();
  }, [unitsData]);

  const handleFileUpload = async (files: FileList | null, unidade: string) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Apenas arquivos JPG e PNG são permitidos');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setIsUploading(true);
    setUploadingUnit(unidade);
    uploadMutation.mutate({ file, unidade });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando galeria...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Images className="w-5 h-5 mr-2 text-purple-600" />
            Galeria de Fotos por Unidade PCBA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar unidade ou departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Unidades</SelectItem>
                {units.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('');
                setSelectedUnit('');
                setCurrentPage(1);
              }}
              variant="outline"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredUnits.length} unidade(s) • {photos.length} foto(s) total
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Unidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentUnits.map((unit) => (
          <Card key={unit.unidade} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 mb-1">
                    {unit.unidade}
                  </CardTitle>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {unit.departamento}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-2">
                  <Camera className="w-3 h-3 mr-1" />
                  {unit.fotos.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Info da Unidade */}
              <div className="text-xs text-gray-600 space-y-1">
                <p>Inspeções: {unit.totalInspecoes}</p>
                {unit.ultimaInspecao && (
                  <p className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Última: {new Date(unit.ultimaInspecao).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files, unit.unidade)}
                  className="hidden"
                  id={`upload-${unit.unidade}`}
                  disabled={isUploading}
                />
                <label htmlFor={`upload-${unit.unidade}`} className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {isUploading && uploadingUnit === unit.unidade ? 'Enviando...' : 'Adicionar Foto'}
                  </p>
                  <p className="text-xs text-gray-500">JPG/PNG até 10MB</p>
                </label>
              </div>

              {/* Fotos */}
              {unit.fotos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Fotos ({unit.fotos.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {unit.fotos.slice(0, 4).map((photo: Photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.imageData}
                          alt={photo.fileName}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            if (confirm(`Deletar ${photo.fileName}?`)) {
                              deleteMutation.mutate(photo.id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                          {photo.fileName}
                        </div>
                      </div>
                    ))}
                    {unit.fotos.length > 4 && (
                      <div className="flex items-center justify-center bg-gray-100 rounded h-20 text-sm text-gray-600">
                        +{unit.fotos.length - 4} mais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {filteredUnits.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma unidade encontrada com os filtros selecionados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}