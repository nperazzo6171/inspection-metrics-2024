import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Images } from "lucide-react";

interface GalleryProps {
  data: any[];
  filters: any;
}

export default function Gallery({ data = [], filters }: GalleryProps) {
  console.log('Gallery: data received:', data?.length || 0);
  console.log('Gallery: filters received:', filters);

  try {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Images className="w-5 h-5 mr-2 text-purple-600" />
              Galeria de Inspeções - DEBUG ({Array.isArray(data) ? data.length : 0} registros)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!Array.isArray(data) ? (
              <div className="p-8 text-center">
                <p className="text-red-600">Erro: dados não são array</p>
                <p className="text-sm text-gray-500">Tipo recebido: {typeof data}</p>
              </div>
            ) : data.length === 0 ? (
              <div className="p-8 text-center">
                <Images className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma inspeção encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Mostrando {Math.min(5, data.length)} de {data.length} inspeções:
                </p>
                <div className="grid gap-4">
                  {data.slice(0, 5).map((inspection, index) => (
                    <Card key={inspection?.id || index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {inspection?.unidadeInspecionada || 'Unidade não informada'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {inspection?.departamento || 'Departamento não informado'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Inspeção #{inspection?.numero || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {inspection?.dataInspecao ? 
                              new Date(inspection.dataInspecao).toLocaleDateString('pt-BR') 
                              : 'Data não informada'
                            }
                          </p>
                        </div>
                      </div>
                      {inspection?.naoConformidade && (
                        <p className="text-sm text-gray-700 mt-2 bg-red-50 p-2 rounded">
                          {inspection.naoConformidade}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
                {data.length > 5 && (
                  <p className="text-center text-sm text-gray-500">
                    ... e mais {data.length - 5} inspeções
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Gallery: erro na renderização:', error);
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Erro na Galeria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Erro ao renderizar galeria:</p>
            <p className="text-sm text-gray-600">{String(error)}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
}