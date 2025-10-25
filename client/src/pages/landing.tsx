import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileSearch,
  TrendingUp,
  Bell,
  Map,
  MessageCircle,
  BarChart3,
  Lock,
  Users,
  CheckCircle,
  ArrowRight,
  Database,
  AlertTriangle,
  FileText,
  Activity
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Autenticação 2FA e criptografia de ponta a ponta para proteção total dos dados institucionais.",
      color: "text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Dashboards Interativos",
      description: "Visualize indicadores em tempo real com gráficos modernos e relatórios personalizados.",
      color: "text-green-600"
    },
    {
      icon: Map,
      title: "Mapa Georreferenciado",
      description: "Localização visual das unidades com indicadores coloridos de conformidade e casos.",
      color: "text-orange-600"
    },
    {
      icon: MessageCircle,
      title: "Assistente com IA",
      description: "Chatbot inteligente disponível 24/7 para orientações e consultas operacionais.",
      color: "text-purple-600"
    },
    {
      icon: Bell,
      title: "Alertas Inteligentes",
      description: "Notificações automáticas para prazos críticos e pendências urgentes.",
      color: "text-red-600"
    },
    {
      icon: Database,
      title: "Integração Total",
      description: "Conectado com SEI, SICORQ e e-PAD para sincronização automática de dados.",
      color: "text-indigo-600"
    }
  ];

  const modules = [
    { name: "Dashboard Geral", icon: Activity, description: "Visão consolidada de todos os indicadores" },
    { name: "Controle de Prazos", icon: AlertTriangle, description: "Monitoramento de regularizações" },
    { name: "CVLI", icon: BarChart3, description: "Crimes Violentos Letais Intencionais" },
    { name: "Armas e Drogas", icon: Shield, description: "Gestão de apreensões" },
    { name: "PADs e Correições", icon: FileText, description: "Processos administrativos" },
    { name: "Cadeia de Custódia", icon: Lock, description: "Implementação e conformidade" },
    { name: "MIAE", icon: FileSearch, description: "Boletins sem inquérito instaurado" },
    { name: "Galeria de Fotos", icon: Users, description: "Registro visual das unidades" }
  ];

  const stats = [
    { label: "Unidades Monitoradas", value: "350+", icon: Users },
    { label: "Indicadores Ativos", value: "25+", icon: TrendingUp },
    { label: "Integrações", value: "5", icon: Database },
    { label: "Disponibilidade", value: "99.9%", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <img
                src="/Novo_Brasao_PCBA-removebg-preview.png"
                alt="Brasão Polícia Civil BA"
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Sistema de Gerenciamento dos Indicadores Correcionais e de Inspeção
                </h1>
                <p className="text-xs text-gray-300">Secretaria da Segurança Pública - Polícia Civil da Bahia</p>
                <p className="text-xs text-yellow-400 font-medium">
                  Corregedoria da Polícia Civil - CORREPOL - Assessoria Técnica
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
            >
              <Lock className="h-4 w-4 mr-2" />
              Acessar Sistema
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-yellow-500 text-slate-900 hover:bg-yellow-600 font-semibold">
            Plataforma Oficial CORREPOL
          </Badge>
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Gestão Inteligente de
            <span className="block text-yellow-500 mt-2">Indicadores Correcionais e de Inspeção</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Plataforma integrada para monitoramento, controle e análise de dados institucionais
            da Polícia Civil da Bahia com segurança, eficiência e inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-lg px-8 font-bold"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-slate-800 text-yellow-400 border-yellow-500 hover:bg-yellow-500 hover:text-slate-900 font-semibold"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <IconComponent className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Recursos da Plataforma
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ferramentas avançadas para gestão completa e eficiente dos processos de inspeção
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-slate-200">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-slate-50 ${feature.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-slate-600">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Módulos Disponíveis</h3>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Acesso centralizado a todos os indicadores e controles institucionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
                  <CardHeader>
                    <IconComponent className="h-8 w-8 text-blue-400 mb-3" />
                    <CardTitle className="text-white text-lg">{module.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 to-slate-800 border-t-4 border-yellow-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-4xl font-bold mb-6">
            Pronto para Transformar sua Gestão?
          </h3>
          <p className="text-xl mb-8 text-gray-300">
            Acesse agora a plataforma e tenha controle total sobre os indicadores correcionais e de inspeção
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/dashboard")}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-lg px-8 font-bold"
          >
            Acessar Plataforma
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-yellow-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/Novo_Brasao_PCBA-removebg-preview.png"
                  alt="Brasão PCBA"
                  className="h-8 w-auto"
                />
                <span className="font-bold text-yellow-400">CORREPOL</span>
              </div>
              <p className="text-sm">
                Sistema de Gerenciamento dos Indicadores Correcionais e de Inspeção
              </p>
              <p className="text-xs text-yellow-500 mt-2">Assessoria Técnica</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Módulos</h4>
              <ul className="space-y-2 text-sm">
                <li>Dashboard</li>
                <li>Relatórios</li>
                <li>Controle de Prazos</li>
                <li>Galeria</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm">
                <li>Assistente IA</li>
                <li>Mapa Interativo</li>
                <li>Notificações</li>
                <li>Integrações</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>Documentação</li>
                <li>Tutoriais</li>
                <li>Contato</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-yellow-500 mt-12 pt-8 text-center text-sm">
            <p className="text-gray-400">&copy; 2025 Polícia Civil da Bahia - CORREPOL. Todos os direitos reservados.</p>
            <p className="text-xs text-yellow-500 mt-2">Assessoria Técnica - Sistema de Gerenciamento dos Indicadores Correcionais e de Inspeção</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
