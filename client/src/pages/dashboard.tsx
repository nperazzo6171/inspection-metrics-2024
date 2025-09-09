import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import DashboardGeneral from "@/components/dashboard-general";
import Reports from "@/components/reports";
import RelatorioPorUnidade from "@/components/relatorio-por-unidade";
// Gallery removida temporariamente
import Deadlines from "@/components/deadlines";
import Normalization from "@/components/normalization";
import NormalizacaoDocs from "@/components/normalizacao-docs";
import StatusRegularizacao from "@/components/controle-prazos";
import AdminUpload from "@/components/admin-upload";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filters, setFilters] = useState({});

  // Real data is loaded automatically from Excel files in the backend

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });

  const { data: reportData } = useQuery({
    queryKey: ['/api/reports/data', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
      // Add cache busting parameter
      params.append('_t', Date.now().toString());
      const response = await fetch(`/api/reports/data?${params}`);
      return response.json();
    },
    enabled: !!Object.keys(filters).length || true, // Always fetch data
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data
  });

  const renderActiveTab = () => {
    // Use filtered data from reportData when available, otherwise fall back to inspections
    const filteredData = reportData?.inspections || inspections;
    
    switch (activeTab) {
      case 'dashboard':
        return <DashboardGeneral data={filteredData as any[]} reportData={reportData} filters={filters} onFilterChange={setFilters} />;
      case 'reports':
        return <Reports data={filteredData as any[]} reportData={reportData} filters={filters} onFilterChange={setFilters} />;
      case 'unidade':
        return <RelatorioPorUnidade data={filteredData as any[]} />;

      case 'deadlines':
        return <Deadlines data={filteredData as any[]} />;
      case 'normalization':
        return <Normalization data={filteredData as any[]} reportData={reportData} />;
      case 'docs-legais':
        return <NormalizacaoDocs />;
      case 'status-regularizacao':
        return <StatusRegularizacao />;
      case 'admin':
        return <AdminUpload />;
      default:
        return <DashboardGeneral data={filteredData as any[]} reportData={reportData} filters={filters} onFilterChange={setFilters} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-police-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}
