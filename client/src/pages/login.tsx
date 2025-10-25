import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { User, Lock, LogIn, AlertCircle, ArrowLeft } from "lucide-react";
import policeBadge from "@assets/R-removebg-preview_1753188946424.png";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    setError('');
    try {
      const result = await login(credentials.username, credentials.password);
      if (!result.success) {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="text-white hover:text-blue-400 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Landing Page
        </Button>
        <div className="text-center">
          <img
            src={policeBadge}
            alt="Brasão Polícia Civil BA"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-6 text-2xl font-bold text-white leading-tight">
            Sistema de Gerenciamento dos Indicadores de Inspeção nas Unidades da Polícia Civil do Estado da Bahia
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            ASTEC - CORREPOL
          </p>
        </div>
        
        <Card className="bg-white shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Usuário
                </Label>
                <Input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                  placeholder="Digite seu usuário"
                />
              </div>
              
              <div>
                <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 mr-2" />
                  Senha
                </Label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  onKeyPress={handleKeyPress}
                  className="w-full"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-police-blue hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Autenticando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Acesso restrito a servidores autorizados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
