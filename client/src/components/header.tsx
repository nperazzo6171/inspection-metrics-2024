import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { BarChart3, Clock, CheckCircle, LogOut, FileText, Building2, Scale, Shield } from "lucide-react";
import policeBadge from "@assets/R-removebg-preview_1753188946424.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const { logout } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: BarChart3 },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'unidade', label: 'Relatório por Unidade', icon: Building2 },
    { id: 'deadlines', label: 'Prazos', icon: Clock },
    { id: 'status-regularizacao', label: 'Status Regularização', icon: Clock },
    { id: 'normalization', label: 'Normalização', icon: CheckCircle },
    { id: 'docs-legais', label: 'Documentos Legais', icon: Scale },
    { id: 'admin', label: 'Administração', icon: Shield }
  ];

  return (
    <header className="bg-black shadow-sm border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-stretch py-2">
          <div className="flex items-center min-w-0 max-w-md">
            <img 
              src={policeBadge} 
              alt="Brasão Polícia Civil BA" 
              className="h-12 w-auto mr-3 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-white leading-tight break-words">
                Sistema de Gerenciamento dos Indicadores de Inspeção nas Unidades da Polícia Civil do Estado da Bahia
              </h1>
              <p className="text-xs text-gray-300 mt-1">ASTEC - CORREPOL</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap gap-1 items-center ml-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    activeTab === tab.id
                      ? 'bg-police-blue text-white hover:bg-blue-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  } text-xs px-2 py-1 whitespace-nowrap`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
          
          <Button
            onClick={logout}
            variant="destructive"
            size="sm"
            className="ml-2 text-xs px-2 py-1 flex-shrink-0"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
