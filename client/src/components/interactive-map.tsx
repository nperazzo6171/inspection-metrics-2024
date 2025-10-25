import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pill,
  Car,
  Filter,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface UnidadeMarker {
  id: string;
  nome: string;
  departamento: string;
  latitude: number;
  longitude: number;
  status: "green" | "yellow" | "orange" | "red" | "black";
  naoConformidades: number;
  drogasApreendidas: number;
  armasApreendidas: number;
  veiculosApreendidos: number;
}

export default function InteractiveMap() {
  const [filter, setFilter] = useState<"all" | "drogas" | "armas" | "veiculos" | "conformidade">("all");
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadeMarker | null>(null);
  const [zoom, setZoom] = useState(1);

  const mockUnidades: UnidadeMarker[] = [
    {
      id: "1",
      nome: "1ª Delegacia Territorial",
      departamento: "DRACO",
      latitude: -12.9714,
      longitude: -38.5014,
      status: "green",
      naoConformidades: 2,
      drogasApreendidas: 15,
      armasApreendidas: 8,
      veiculosApreendidos: 3
    },
    {
      id: "2",
      nome: "Delegacia de Homicídios",
      departamento: "DHPP",
      latitude: -12.9834,
      longitude: -38.4764,
      status: "yellow",
      naoConformidades: 8,
      drogasApreendidas: 45,
      armasApreendidas: 22,
      veiculosApreendidos: 12
    },
    {
      id: "3",
      nome: "DRFRV - Feira de Santana",
      departamento: "DRFRV",
      latitude: -12.2664,
      longitude: -38.9663,
      status: "orange",
      naoConformidades: 15,
      drogasApreendidas: 87,
      armasApreendidas: 45,
      veiculosApreendidos: 28
    },
    {
      id: "4",
      nome: "Delegacia Especial",
      departamento: "DEAM",
      latitude: -12.9500,
      longitude: -38.4300,
      status: "red",
      naoConformidades: 25,
      drogasApreendidas: 120,
      armasApreendidas: 67,
      veiculosApreendidos: 42
    },
    {
      id: "5",
      nome: "Delegacia de Tráfico",
      departamento: "DTE",
      latitude: -13.0100,
      longitude: -38.5200,
      status: "black",
      naoConformidades: 35,
      drogasApreendidas: 250,
      armasApreendidas: 105,
      veiculosApreendidos: 68
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      green: "#10b981",
      yellow: "#eab308",
      orange: "#f97316",
      red: "#ef4444",
      black: "#1f2937"
    };
    return colors[status as keyof typeof colors] || colors.green;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      green: "Conforme",
      yellow: "Atenção",
      orange: "Alerta",
      red: "Crítico",
      black: "Emergencial"
    };
    return labels[status as keyof typeof labels];
  };

  const getMetricValue = (unidade: UnidadeMarker) => {
    switch (filter) {
      case "drogas":
        return unidade.drogasApreendidas;
      case "armas":
        return unidade.armasApreendidas;
      case "veiculos":
        return unidade.veiculosApreendidos;
      case "conformidade":
        return unidade.naoConformidades;
      default:
        return unidade.naoConformidades;
    }
  };

  const filteredUnidades = useMemo(() => {
    return mockUnidades;
  }, []);

  const getBubbleSize = (value: number) => {
    const baseSize = 30;
    const maxSize = 80;
    const scaleFactor = Math.min(value / 50, 2);
    return Math.min(baseSize + (scaleFactor * 25), maxSize);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Mapa Interativo de Unidades Policiais
          </CardTitle>
          <CardDescription>
            Visualização georreferenciada com indicadores de conformidade e apreensões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione filtro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Indicadores</SelectItem>
                <SelectItem value="conformidade">Não Conformidades</SelectItem>
                <SelectItem value="drogas">Drogas Apreendidas</SelectItem>
                <SelectItem value="armas">Armas Apreendidas</SelectItem>
                <SelectItem value="veiculos">Veículos Apreendidos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-700">Conforme (0-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-slate-700">Atenção (6-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-orange-500"></div>
              <span className="text-sm text-slate-700">Alerta (11-20)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-700">Crítico (21-30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-800"></div>
              <span className="text-sm text-slate-700">Emergencial (30+)</span>
            </div>
          </div>

          <div
            className="relative bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden"
            style={{ height: "500px" }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${zoom})`,
                transition: "transform 0.3s ease"
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 800 500">
                <rect width="800" height="500" fill="#f8fafc" />

                <path
                  d="M 100,100 L 700,100 L 700,400 L 100,400 Z"
                  fill="#e2e8f0"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />

                {filteredUnidades.map((unidade) => {
                  const x = ((unidade.longitude + 38.5) * 100) + 200;
                  const y = ((unidade.latitude + 13) * 50) + 100;
                  const size = getBubbleSize(getMetricValue(unidade));
                  const color = getStatusColor(unidade.status);

                  return (
                    <g
                      key={unidade.id}
                      onClick={() => setSelectedUnidade(unidade)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={size / 2}
                        fill={color}
                        opacity="0.3"
                        stroke={color}
                        strokeWidth="2"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={size / 4}
                        fill={color}
                      />
                      <text
                        x={x}
                        y={y - size / 2 - 10}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#1e293b"
                        fontWeight="bold"
                      >
                        {unidade.nome.split(" ")[0]}
                      </text>
                      {selectedUnidade?.id === unidade.id && (
                        <rect
                          x={x - 60}
                          y={y - 100}
                          width="120"
                          height="80"
                          fill="white"
                          stroke={color}
                          strokeWidth="2"
                          rx="5"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {selectedUnidade && (
              <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border-2 border-blue-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedUnidade.nome}</h3>
                    <p className="text-sm text-slate-600">{selectedUnidade.departamento}</p>
                  </div>
                  <Badge
                    style={{ backgroundColor: getStatusColor(selectedUnidade.status) }}
                    className="text-white"
                  >
                    {getStatusLabel(selectedUnidade.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs text-slate-600">Não Conform.</p>
                      <p className="text-lg font-bold text-slate-900">{selectedUnidade.naoConformidades}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <Pill className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-slate-600">Drogas</p>
                      <p className="text-lg font-bold text-slate-900">{selectedUnidade.drogasApreendidas}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-slate-600">Armas</p>
                      <p className="text-lg font-bold text-slate-900">{selectedUnidade.armasApreendidas}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Car className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-600">Veículos</p>
                      <p className="text-lg font-bold text-slate-900">{selectedUnidade.veiculosApreendidos}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUnidade(null)}
                  className="w-full mt-3"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredUnidades.slice(0, 4).map((unidade) => (
              <Card
                key={unidade.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedUnidade(unidade)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(unidade.status) }}
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-1">
                    {unidade.nome}
                  </h4>
                  <p className="text-xs text-slate-600">{unidade.departamento}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Não Conf.</span>
                    <span className="font-bold text-slate-900">{unidade.naoConformidades}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
