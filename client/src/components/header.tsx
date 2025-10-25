import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  BarChart3, Clock, CheckCircle, LogOut, FileText, Building2, Scale,
  Shield, Zap, Package, Car, Users, Target, AlertTriangle, Gavel,
  FileCheck, Clock3, UserCheck, Map, Activity, Lock, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import policeBadge from "/Novo_Brasao_PCBA-removebg-preview.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { logout } = useAuth();

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: BarChart3 },
    { id: 'mapa-interativo', label: 'Mapa Interativo', icon: Map },
    { id: 'cvli', label: 'CVLI', icon: Activity },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'unidade', label: 'Relatório por Unidade', icon: Building2 },
    { id: 'deadlines', label: 'Prazos', icon: Clock },
  ];

  const regulationTabs = [
    { id: 'status-regularizacao', label: 'Status Regularização', icon: CheckCircle },
    { id: 'cadeia-custodia', label: 'Cadeia de Custódia', icon: Lock },
    { id: 'carceragens', label: 'Carceragens Interditadas', icon: Building2 },
    { id: 'normalization', label: 'Normalização', icon: CheckCircle },
    { id: 'docs-legais', label: 'Documentos Legais', icon: Scale },
  ];

  const evidenceTabs = [
    { id: 'armas-apreendidas', label: 'Armas Apreendidas', icon: Zap },
    { id: 'drogas-recolhidas', label: 'Drogas Recolhidas', icon: Package },
    { id: 'veiculos-apreendidos', label: 'Veículos Apreendidos', icon: Car },
    { id: 'passagem-gestao', label: 'Passagem de Gestão', icon: Users },
    { id: 'exercicio-cumulativo', label: 'Exercício Cumulativo', icon: Target },
  ];

  const investigationTabs = [
    { id: 'milae-sem-ip', label: 'MILAE sem IP', icon: AlertTriangle },
    { id: 'demandas-mpe', label: 'Demandas MPE', icon: Gavel },
    { id: 'controles-correcionais', label: 'Controles Correcionais', icon: FileCheck },
    { id: 'investigacoes-preliminares', label: 'Investigações Preliminares', icon: Clock3 },
  ];

  const adminTabs = [
    { id: 'termo-cooperacao-vencido', label: 'Termo Cooperação Vencido', icon: UserCheck },
    { id: 'comissao-avaliacao', label: 'Comissão de Avaliação', icon: FileText },
    { id: 'admin', label: 'Administração', icon: Shield }
  ];

  const getActiveLabel = () => {
    const allTabs = [...mainTabs, ...regulationTabs, ...evidenceTabs, ...investigationTabs, ...adminTabs];
    return allTabs.find(tab => tab.id === activeTab)?.label || 'Dashboard';
  };

  return (
    <header className="bg-slate-900 shadow-lg border-b-2 border-yellow-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-4">
            <img
              src={policeBadge}
              alt="Brasão Polícia Civil BA"
              className="h-16 w-auto flex-shrink-0"
            />
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                Sistema de Gerenciamento dos Indicadores
              </h1>
              <h2 className="text-sm font-semibold text-white leading-tight">
                Correcionais e de Inspeção
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Secretaria da Segurança Pública - Polícia Civil da Bahia
              </p>
              <p className="text-xs text-yellow-400 font-semibold">
                Corregedoria da Polícia Civil - CORREPOL - Assessoria Técnica
              </p>
            </div>
          </div>

          <Button
            onClick={logout}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700 flex-shrink-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <div className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1 py-2">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-600 font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  } whitespace-nowrap`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 whitespace-nowrap"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Regularização
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-yellow-400">Controle de Regularização</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {regulationTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 whitespace-nowrap"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Bens Apreendidos
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-yellow-400">Gestão de Evidências</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {evidenceTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 whitespace-nowrap"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Investigações
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-yellow-400">Controle de Investigações</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {investigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Administração
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700">
                <DropdownMenuLabel className="text-yellow-400">Funções Administrativas</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
