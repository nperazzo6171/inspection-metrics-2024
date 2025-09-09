import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, Shield, CheckCircle, AlertCircle, Info, LogOut, Clock, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import AdminAuth from "./admin-auth";

export default function AdminUpload() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [controlePrazosFile, setControlePrazosFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingControlePrazos, setUploadingControlePrazos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [controlePrazosProgress, setControlePrazosProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [controlePrazosResult, setControlePrazosResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [controlePrazosError, setControlePrazosError] = useState<string>('');
  const [deletingInspections, setDeletingInspections] = useState(false);
  const [deletingControlePrazos, setDeletingControlePrazos] = useState(false);
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Verificar se já está autenticado como admin na sessão
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAdminAuthenticated(false);
    setFile(null);
    setControlePrazosFile(null);
    setResult(null);
    setControlePrazosResult(null);
    setError('');
    setControlePrazosError('');
  };

  // Se não está autenticado como admin, mostrar tela de autenticação
  if (!isAdminAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAdminAuthenticated(true)} />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Apenas arquivos Excel (.xlsx, .xls) são permitidos');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleControlePrazosFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setControlePrazosError('Apenas arquivos Excel (.xlsx, .xls) são permitidos');
        return;
      }
      setControlePrazosFile(selectedFile);
      setControlePrazosError('');
      setControlePrazosResult(null);
    }
  };

  const handleDeleteAllInspections = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação removerá TODOS os dados de inspeções do sistema. Esta operação não pode ser desfeita. Confirma?')) {
      return;
    }

    setDeletingInspections(true);
    setDeleteResult(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      const response = await fetch('/api/admin/delete-all-inspections', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover dados');
      }

      setDeleteResult(data);
      
      // Invalidar cache do React Query para atualizar todas as telas
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/reports/data'] });
      await queryClient.refetchQueries({ queryKey: ['/api/inspections'] });
      await queryClient.refetchQueries({ queryKey: ['/api/reports/data'] });
      
      // Forçar atualização da página se necessário
      window.location.reload();

    } catch (err: any) {
      setError(err.message || 'Erro ao remover dados de inspeções');
    } finally {
      setDeletingInspections(false);
    }
  };

  const handleDeleteAllControlePrazos = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação removerá TODOS os dados de controle de prazos do sistema. Esta operação não pode ser desfeita. Confirma?')) {
      return;
    }

    setDeletingControlePrazos(true);
    setDeleteResult(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      const response = await fetch('/api/admin/delete-all-controle-prazos', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover dados');
      }

      setDeleteResult(data);
      
      // Invalidar cache do React Query para atualizar todas as telas
      await queryClient.invalidateQueries({ queryKey: ['/api/controle-prazos'] });
      await queryClient.refetchQueries({ queryKey: ['/api/controle-prazos'] });
      
      // Forçar atualização da página se necessário
      window.location.reload();

    } catch (err: any) {
      setControlePrazosError(err.message || 'Erro ao remover dados de controle de prazos');
    } finally {
      setDeletingControlePrazos(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecione um arquivo Excel');
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('excel', file);

      // Obter token de acesso do localStorage
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      setUploadProgress(30);

      const response = await fetch('/api/admin/upload-excel', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setUploadProgress(70);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload');
      }

      setUploadProgress(100);
      setResult(data);
      setFile(null);
      
      // Invalidar cache do React Query para forçar recarregamento dos dados
      await queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/reports/data'] });
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      console.log('✅ Cache invalidado, dados atualizados');

    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da planilha');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleControlePrazosUpload = async () => {
    if (!controlePrazosFile) {
      setControlePrazosError('Selecione um arquivo Excel');
      return;
    }

    if (!user) {
      setControlePrazosError('Usuário não autenticado');
      return;
    }

    setUploadingControlePrazos(true);
    setControlePrazosProgress(10);
    setControlePrazosError('');
    setControlePrazosResult(null);

    try {
      const formData = new FormData();
      formData.append('excel', controlePrazosFile);

      // Obter token de acesso do localStorage
      const accessToken = localStorage.getItem('accessToken');
      console.log('🔑 Verificando token de acesso:', accessToken ? 'Presente' : 'Ausente');
      console.log('👤 Usuário logado:', user?.username);
      
      if (!accessToken) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      setControlePrazosProgress(30);

      console.log('📤 Iniciando upload de controle de prazos...');
      const response = await fetch('/api/admin/upload-controle-prazos', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      setControlePrazosProgress(70);
      console.log('📊 Response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro no upload:', data);
        throw new Error(data.error || data.message || 'Erro no upload');
      }

      setControlePrazosProgress(100);
      setControlePrazosResult(data);
      setControlePrazosFile(null);
      
      // Invalidar cache do React Query para forçar recarregamento dos dados
      await queryClient.invalidateQueries({ queryKey: ['/api/controle-prazos'] });
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('controle-prazos-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      console.log('✅ Cache invalidado, dados de controle de prazos atualizados');

    } catch (err: any) {
      setControlePrazosError(err.message || 'Erro ao fazer upload da planilha de controle de prazos');
    } finally {
      setUploadingControlePrazos(false);
      setTimeout(() => setControlePrazosProgress(0), 1000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-police-blue" />
              Administração - Upload de Planilha Excel
            </div>
            <Button
              onClick={handleAdminLogout}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sair da Administração
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Info sobre acesso restrito */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Acesso Restrito:</strong> Esta funcionalidade está disponível apenas para administradores autenticados. 
              O upload substituirá todos os dados existentes no banco com os dados da nova planilha.
            </AlertDescription>
          </Alert>

          {/* Upload Section - Dados de Inspeção */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload de Dados de Inspeção
            </h3>

            <div className="space-y-4">
            <div>
              <Label htmlFor="excel-file" className="flex items-center mb-2">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Selecionar Planilha Excel
              </Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Arquivo:</strong> {file.name}</p>
                  <p><strong>Tamanho:</strong> {formatFileSize(file.size)}</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processando...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-police-blue hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando Planilha...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload e Atualizar Banco de Dados
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Result */}
          {result && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p><strong>Upload realizado com sucesso!</strong></p>
                  <p><strong>Registros processados:</strong> {result.count}</p>
                  <p><strong>Carregado por:</strong> {result.uploadedBy}</p>
                  <p><strong>Data/Hora:</strong> {new Date(result.timestamp).toLocaleString('pt-BR')}</p>
                  <p className="text-sm mt-2">{result.message}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

            {/* Requirements Info - Dados de Inspeção */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Requisitos da Planilha de Inspeção:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Formato: .xlsx ou .xls</li>
                <li>• Primeira linha deve conter os cabeçalhos das colunas</li>
                <li>• Colunas obrigatórias: Unidade Inspecionada, Departamento</li>
                <li>• Colunas suportadas: Nº, Data da Inspeção, Delegado Corregedor, Não Conformidade, etc.</li>
                <li>• Tamanho máximo: 50MB</li>
              </ul>
            </div>
          </div>

          {/* Upload Section - Controle de Prazos */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upload de Controle de Prazos
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="controle-prazos-file" className="flex items-center mb-2">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Selecionar Planilha de Controle de Prazos
                </Label>
                <Input
                  id="controle-prazos-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleControlePrazosFileChange}
                  disabled={uploadingControlePrazos}
                  className="cursor-pointer"
                />
                {controlePrazosFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Arquivo:</strong> {controlePrazosFile.name}</p>
                    <p><strong>Tamanho:</strong> {formatFileSize(controlePrazosFile.size)}</p>
                  </div>
                )}
              </div>

              {/* Progress Bar - Controle de Prazos */}
              {uploadingControlePrazos && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando...</span>
                    <span>{controlePrazosProgress}%</span>
                  </div>
                  <Progress value={controlePrazosProgress} className="h-2" />
                </div>
              )}

              {/* Upload Button - Controle de Prazos */}
              <Button
                onClick={handleControlePrazosUpload}
                disabled={!controlePrazosFile || uploadingControlePrazos}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {uploadingControlePrazos ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando Controle de Prazos...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Controle de Prazos
                  </>
                )}
              </Button>
            </div>

            {/* Error Message - Controle de Prazos */}
            {controlePrazosError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{controlePrazosError}</AlertDescription>
              </Alert>
            )}

            {/* Success Result - Controle de Prazos */}
            {controlePrazosResult && (
              <Alert className="border-green-200 bg-green-50 mt-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p><strong>Upload de controle de prazos realizado com sucesso!</strong></p>
                    <p><strong>Registros processados:</strong> {controlePrazosResult.count}</p>
                    <p><strong>Carregado por:</strong> {controlePrazosResult.uploadedBy}</p>
                    <p><strong>Data/Hora:</strong> {new Date(controlePrazosResult.timestamp).toLocaleString('pt-BR')}</p>
                    <p className="text-sm mt-2">{controlePrazosResult.message}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Requirements Info - Controle de Prazos */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">Requisitos da Planilha de Controle de Prazos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Formato: .xlsx ou .xls</li>
                <li>• Colunas obrigatórias: <strong>Unidade, Ofício, Link SEI, Não Conformidade, Data Recebimento, Data Prazo, Status</strong></li>
                <li>• Status aceitos: "Regularizado", "Não Regularizado", "Pendente"</li>
                <li>• Datas em formato DD/MM/AAAA ou formato Excel</li>
                <li>• Tamanho máximo: 50MB</li>
              </ul>
            </div>
          </div>

          {/* Delete Section */}
          <div className="border rounded-lg p-4 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-red-700">
              <Trash2 className="w-5 h-5 mr-2" />
              Remoção de Dados
            </h3>

            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ ATENÇÃO:</strong> As operações abaixo removem TODOS os dados do sistema e não podem ser desfeitas. Use com extrema cautela.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleDeleteAllInspections}
                  disabled={deletingInspections}
                  variant="destructive"
                  className="w-full"
                >
                  {deletingInspections ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Removendo Dados de Inspeções...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Todos os Dados de Inspeções
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleDeleteAllControlePrazos}
                  disabled={deletingControlePrazos}
                  variant="destructive"
                  className="w-full"
                >
                  {deletingControlePrazos ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Removendo Dados de Controle de Prazos...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Todos os Dados de Controle de Prazos
                    </>
                  )}
                </Button>
              </div>

              {deleteResult && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-2">
                      <p><strong>Operação realizada com sucesso!</strong></p>
                      <p><strong>Executado por:</strong> {deleteResult.deletedBy}</p>
                      <p><strong>Data/Hora:</strong> {new Date(deleteResult.timestamp).toLocaleString('pt-BR')}</p>
                      <p className="text-sm mt-2">{deleteResult.message}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}