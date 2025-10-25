import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Trash2,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  context?: string;
}

export default function AIAssistant({ context }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou o assistente virtual do Sistema de Inspeção da PCBA. Como posso ajudá-lo hoje?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const contextualSuggestions = [
    "Como consultar prazos de regularização?",
    "Explicar status de não conformidade",
    "Como fazer upload de dados?",
    "Gerar relatório por unidade",
    "O que significa CVLI?",
    "Como ativar autenticação 2FA?",
    "Explicar níveis de acesso no sistema",
    "Como exportar dados para Excel?"
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateResponse(inputMessage, context),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (query: string, ctx?: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("2fa") || lowerQuery.includes("dois fatores") || lowerQuery.includes("autenticação")) {
      return "🔐 A autenticação de dois fatores (2FA) adiciona uma camada extra de segurança. Para ativar:\n\n1. Acesse a aba 'Administração'\n2. Clique em 'Configurar 2FA'\n3. Escaneie o QR Code com um app autenticador (Google Authenticator, Authy, etc.)\n4. Digite o código de 6 dígitos para confirmar\n\nApós ativado, você precisará inserir um código a cada login.";
    }

    if (lowerQuery.includes("nível") || lowerQuery.includes("acesso") || lowerQuery.includes("permissão")) {
      return "👥 O sistema possui diferentes níveis de acesso:\n\n• Visitante: Visualização de relatórios públicos\n• Operador: Consulta completa de dados\n• Gestor: Edição e aprovação de registros\n• Administrador: Acesso total, incluindo upload de dados e configurações\n\nContate o administrador do sistema para solicitar mudanças de permissão.";
    }

    if (lowerQuery.includes("excel") || lowerQuery.includes("exportar") || lowerQuery.includes("download")) {
      return "📊 Para exportar dados para Excel:\n\n1. Acesse qualquer relatório ou tabela\n2. Aplique os filtros desejados\n3. Clique no botão 'Exportar' no canto superior direito\n4. Escolha o formato (Excel, CSV ou PDF)\n\nOs dados serão baixados com todos os filtros aplicados.";
    }

    if (lowerQuery.includes("prazo") || lowerQuery.includes("regularização")) {
      return "📅 Para consultar prazos de regularização:\n\nAcesse a aba 'Prazos' no menu principal. Lá você encontrará:\n• Prazos ativos\n• Prazos próximos do vencimento (amarelo)\n• Prazos expirados (vermelho)\n• Organização por unidade policial\n\nVocê pode filtrar por departamento, período e status.";
    }

    if (lowerQuery.includes("não conformidade") || lowerQuery.includes("status")) {
      return "⚠️ As não conformidades são classificadas por:\n\n• Criticidade: Alta, Média, Baixa\n• Status de prazo: 'Dentro do prazo', 'Próximo do vencimento' ou 'Prazo expirado'\n• Tipo: Estrutural, Documental, Operacional\n\nVocê pode filtrar por qualquer desses critérios nos relatórios.";
    }

    if (lowerQuery.includes("upload") || lowerQuery.includes("carregar")) {
      return "📤 Para fazer upload de dados:\n\n1. Acesse a aba 'Administração'\n2. Clique em 'Upload de Dados'\n3. Selecione o tipo de dados (Inspeções, Prazos, etc.)\n4. Escolha o arquivo Excel\n5. Confirme o upload\n\n⚠️ Apenas administradores podem realizar uploads. O arquivo deve seguir o modelo padrão.";
    }

    if (lowerQuery.includes("relatório") || lowerQuery.includes("relatorio")) {
      return "📋 Para gerar relatórios:\n\n1. Acesse a aba 'Relatórios'\n2. Selecione o tipo de relatório\n3. Aplique filtros: ano, departamento, unidade, período\n4. Clique em 'Gerar Relatório'\n5. Exporte em PDF, Excel ou visualize online\n\nOs relatórios incluem gráficos e análises detalhadas.";
    }

    if (lowerQuery.includes("cvli")) {
      return "🔍 CVLI (Crimes Violentos Letais Intencionais)\n\nAgrupa:\n• Homicídios dolosos\n• Latrocínios\n• Lesões corporais seguidas de morte\n\nÉ um indicador-chave para análise de segurança pública e está disponível no dashboard CVLI.";
    }

    if (lowerQuery.includes("milae") || lowerQuery.includes("mpe")) {
      return "⚖️ MILAE sem IP\n\nRefere-se a boletins de ocorrência encaminhados ao Ministério Público que ainda não tiveram inquérito policial instaurado.\n\nNa aba 'MILAE sem IP' você pode:\n• Visualizar pendências\n• Filtrar por unidade e período\n• Acompanhar prazos\n• Exportar relatórios";
    }

    if (lowerQuery.includes("mapa") || lowerQuery.includes("geolocalização")) {
      return "🗺️ Mapa Interativo\n\nExibe a localização de todas as unidades policiais com indicadores visuais:\n\n🟢 Verde: Indicadores baixos/normais\n🟡 Amarelo: Indicadores médios/atenção\n🟠 Laranja: Indicadores altos/preocupantes\n🔴 Vermelho: Indicadores críticos/urgentes\n\nClique em qualquer bolha para ver detalhes da unidade.";
    }

    if (lowerQuery.includes("galeria") || lowerQuery.includes("fotos") || lowerQuery.includes("imagens")) {
      return "📸 Galeria de Fotos\n\nVisualize imagens das unidades inspecionadas:\n• Organizadas por unidade e departamento\n• Filtros por tipo de inspeção\n• Zoom e visualização em tela cheia\n• Download de imagens\n\nÚtil para documentação visual das condições encontradas.";
    }

    if (lowerQuery.includes("dashboard") || lowerQuery.includes("painel")) {
      return "📊 Dashboard Geral\n\nVisão consolidada com:\n• Indicadores principais (KPIs)\n• Gráficos de tendências\n• Distribuição por departamento\n• Alertas de prazos\n• Comparativos históricos\n\nUse os filtros no topo para personalizar a visualização.";
    }

    if (lowerQuery.includes("ajuda") || lowerQuery.includes("suporte") || lowerQuery.includes("help")) {
      return "🆘 Precisa de ajuda?\n\nEstou aqui para ajudar com:\n• Navegação no sistema\n• Explicação de indicadores\n• Geração de relatórios\n• Consulta de prazos\n• Dúvidas sobre 2FA\n• Exportação de dados\n• Configurações de acesso\n\nDigite sua dúvida ou escolha uma sugestão abaixo!";
    }

    return "Entendi sua pergunta. 🤔\n\nPosso ajudar com:\n✓ Consultas de prazos e regularização\n✓ Status de não conformidades\n✓ Geração e exportação de relatórios\n✓ Explicação de indicadores (CVLI, MILAE, etc.)\n✓ Navegação no sistema\n✓ Configuração de 2FA\n✓ Níveis de acesso\n\nDigite 'ajuda' para ver todas as opções ou escolha uma sugestão!";
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Conversa limpa. Como posso ajudá-lo?",
        timestamp: new Date()
      }
    ]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 shadow-2xl border-2 border-blue-200 z-50 transition-all duration-300 ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-base">Assistente Virtual PCBA</CardTitle>
            <Badge className="bg-green-500 text-white">Online</Badge>
          </div>
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearConversation}
                className="h-8 w-8 hover:bg-blue-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 hover:bg-blue-800"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 hover:bg-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(100%-73px)]">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.role === "user" ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-slate-700" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="p-2 rounded-full bg-slate-200">
                      <Bot className="h-4 w-4 text-slate-700" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="mt-6 space-y-2">
                <p className="text-xs text-slate-600 font-semibold">Sugestões:</p>
                {contextualSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left justify-start text-xs h-auto py-2"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4 bg-slate-50">
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Pressione Enter para enviar
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
