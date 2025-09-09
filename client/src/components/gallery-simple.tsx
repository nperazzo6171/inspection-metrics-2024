import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Images, Upload } from "lucide-react";

interface GallerySimpleProps {
  data: any[];
  filters: any;
}

export default function GallerySimple({ data = [] }: GallerySimpleProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Teste de upload simples
  const handleUpload = async (file: File, unidade: string) => {
    setIsUploading(true);
    setUploadStatus('Processando arquivo...');
    
    try {
      // Comprimir imagem
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Redimensionar
      canvas.width = 800;
      canvas.height = 600;
      ctx?.drawImage(img, 0, 0, 800, 600);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.7);
      setUploadStatus('Enviando para servidor...');

      // Enviar para API
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

      const responseText = await response.text();
      console.log('Resposta do servidor:', response.status, responseText);

      if (response.ok) {
        setUploadStatus(`✅ ${file.name} salva com sucesso!`);
      } else {
        setUploadStatus(`❌ Erro ${response.status}: ${responseText}`);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadStatus(`❌ Erro: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Apenas JPG e PNG são permitidos');
      return;
    }

    await handleUpload(file, 'TESTE_UNIDADE');
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Images className="w-5 h-5 mr-2 text-purple-600" />
            Galeria - Teste Simples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={onFileChange}
                className="hidden"
                id="upload-test"
                disabled={isUploading}
              />
              <label htmlFor="upload-test" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {isUploading ? 'Enviando...' : 'Clique para fazer upload'}
                </p>
                <p className="text-sm text-gray-500">JPG, PNG até 10MB</p>
              </label>
            </div>

            {uploadStatus && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{uploadStatus}</p>
              </div>
            )}

            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/gallery/photos');
                  const photos = await response.json();
                  console.log('Fotos no banco:', photos);
                  setUploadStatus(`📊 Banco: ${photos.length} fotos`);
                } catch (error) {
                  console.error('Erro ao buscar fotos:', error);
                  setUploadStatus(`❌ Erro ao buscar: ${error}`);
                }
              }}
              variant="outline"
              size="sm"
            >
              Verificar Banco
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}