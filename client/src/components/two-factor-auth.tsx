import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Copy, Check, Smartphone, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface TwoFactorAuthProps {
  onVerify: (code: string) => Promise<boolean>;
  onSetup?: () => Promise<{ secret: string; qrCode: string }>;
  isSetup?: boolean;
}

export default function TwoFactorAuth({ onVerify, onSetup, isSetup = false }: TwoFactorAuthProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Digite um código de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await onVerify(code);
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setCode("");
        }, 2000);
      } else {
        setError("Código inválido. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao verificar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    if (!onSetup) return;

    setIsLoading(true);
    try {
      const data = await onSetup();
      setSetupData(data);
      setShowSetup(true);
    } catch (err) {
      setError("Erro ao configurar 2FA");
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isSetup) {
    return (
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={handleSetup}>
            <Shield className="w-4 h-4 mr-2" />
            Configurar 2FA
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Configurar Autenticação de Dois Fatores
            </DialogTitle>
            <DialogDescription>
              Adicione uma camada extra de segurança à sua conta
            </DialogDescription>
          </DialogHeader>

          {setupData && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block border-2">
                  <img
                    src={setupData.qrCode}
                    alt="QR Code 2FA"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ou insira manualmente:</Label>
                <div className="flex space-x-2">
                  <Input
                    value={setupData.secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copySecret}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Instruções:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Instale um app autenticador (Google Authenticator, Authy)</li>
                    <li>Escaneie o QR Code ou insira o código manualmente</li>
                    <li>Digite o código de 6 dígitos para confirmar</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Código de Verificação</Label>
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleVerify}
                disabled={isLoading || code.length !== 6}
                className="w-full"
              >
                {isLoading ? "Verificando..." : "Ativar 2FA"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Key className="w-5 h-5 mr-2" />
          Verificação em Duas Etapas
        </CardTitle>
        <CardDescription>
          Digite o código de 6 dígitos do seu aplicativo autenticador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="2fa-code">Código de Verificação</Label>
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup className="gap-2 w-full justify-center">
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Código verificado com sucesso!
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleVerify}
          disabled={isLoading || code.length !== 6}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Verificando..." : "Verificar Código"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Não recebeu o código? Verifique o horário do seu dispositivo ou
          reabra o aplicativo autenticador.
        </p>
      </CardContent>
    </Card>
  );
}
