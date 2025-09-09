import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Key, AlertCircle } from "lucide-react";

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export default function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = async () => {
    if (!adminPassword) {
      setError('Digite a senha de administração');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verificar senha administrativa específica
      const response = await fetch('/api/admin/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ adminPassword })
      });

      const result = await response.json();

      if (result.success) {
        // Armazenar autenticação admin no sessionStorage (válida apenas para a sessão)
        sessionStorage.setItem('adminAuth', 'true');
        onAuthenticated();
      } else {
        setError(result.message || 'Senha de administração incorreta');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdminAuth();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <Shield className="w-6 h-6 mr-2 text-police-blue" />
            Acesso Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <strong>Área Restrita:</strong> Esta seção requer autenticação administrativa adicional. 
              Apenas pessoal autorizado da ASTEC-CORREPOL pode acessar as funcionalidades de upload de dados.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-password" className="flex items-center mb-2">
                <Lock className="w-4 h-4 mr-2" />
                Senha de Administração
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite a senha administrativa"
                className="w-full"
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleAdminAuth}
              disabled={loading || !adminPassword}
              className="w-full bg-police-blue hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Acessar Administração
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Se você não possui acesso administrativo,</p>
            <p>entre em contato com a coordenação da ASTEC-CORREPOL.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}