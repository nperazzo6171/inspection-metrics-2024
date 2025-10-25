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
    "O que significa CVLI?"
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

    if (lowerQuery.includes("prazo") || lowerQuery.includes("regularização")) {
      return "Para consultar prazos de regularização, acesse a aba 'Status de Regularização' no menu principal. Lá você encontrará todos os prazos ativos, vencidos e próximos do vencimento, organizados por unidade policial.";
    }

    if (lowerQuery.includes("não conformidade") || lowerQuery.includes("status")) {
      return "As não conformidades são classificadas por criticidade (Alta, Média, Baixa) e possuem status de prazo: 'Dentro do prazo', 'Próximo do vencimento' ou 'Prazo expirado'. Você pode filtrar por qualquer desses critérios nos relatórios.";
    }

    if (lowerQuery.includes("upload") || lowerQuery.includes("carregar")) {
      return "Para fazer upload de dados, acesse a área administrativa através do ícone de configuração no menu. Você precisará de permissões especiais e poderá carregar planilhas Excel com dados de inspeções ou controle de prazos.";
    }

    if (lowerQuery.includes("relatório") || lowerQuery.includes("relatorio")) {
      return "Você pode gerar relatórios personalizados na aba 'Relatórios'. Aplique filtros por ano, departamento, unidade ou período, e exporte os resultados em PDF para análise detalhada.";
    }

    if (lowerQuery.includes("cvli")) {
      return "CVLI significa Crimes Violentos Letais Intencionais. Esta métrica agrupa homicídios, latrocínios e lesões corporais seguidas de morte, sendo um indicador importante para análise de segurança pública.";
    }

    if (lowerQuery.includes("miae")) {
      return "MIAE refere-se ao Ministério Público. A aba 'MIAE sem IP' lista boletins de ocorrência que ainda não tiveram inquérito policial instaurado, permitindo acompanhamento dessas pendências.";
    }

    if (lowerQuery.includes("mapa") || lowerQuery.includes("geolocalização")) {
      return "O mapa interativo exibe a localização geográfica de todas as unidades policiais. As bolhas coloridas indicam diferentes níveis de indicadores: verde (baixo), amarelo (médio), laranja (alto) e vermelho (crítico).";
    }

    if (lowerQuery.includes("galeria") || lowerQuery.includes("fotos")) {
      return "A galeria de fotos permite visualizar imagens das unidades inspecionadas, organizadas por unidade e departamento. É útil para documentação visual das condições encontradas.";
    }

    return "Entendi sua pergunta. Para informações mais específicas, você pode navegar pelos diferentes módulos do sistema ou consultar a documentação completa. Posso ajudar com: consultas de prazos, status de regularização, geração de relatórios, explicação de indicadores e navegação no sistema.";
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
