import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";

interface ServiceFiltersProps {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAddNew: () => void;
  onOpenFilters: () => void;
  onClearAdvancedFilters?: () => void;
  filteredServicesCount: number;
  totalServicesCount: number;
  advancedFilters?: {
    dateRange: { start: Date | null; end: Date | null };
    priceRange: string;
    duration: string;
  };
}

const serviceCategories = [
  { value: "clinico_geral", label: "Clínico Geral" },
  { value: "ortodontia", label: "Ortodontia" },
  { value: "endodontia", label: "Endodontia" },
  { value: "implantodontia", label: "Implantodontia" },
  { value: "periodontia", label: "Periodontia" },
  { value: "proteses", label: "Próteses" },
  { value: "odontopediatria", label: "Odontopediatria" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "radiologia", label: "Radiologia" },
  { value: "estetica", label: "Estética" },
  { value: "preventivo", label: "Preventivo" },
  { value: "outros", label: "Outros" },
];

const ServiceFilters: React.FC<ServiceFiltersProps> = ({
  searchTerm,
  categoryFilter,
  statusFilter,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onAddNew,
  onOpenFilters,
  onClearAdvancedFilters,
  filteredServicesCount,
  totalServicesCount,
  advancedFilters,
}) => {
  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onStatusChange("all");
    if (onClearAdvancedFilters) {
      onClearAdvancedFilters();
    }
  };

  const hasActiveFilters =
    searchTerm ||
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    (advancedFilters?.dateRange?.start !== null &&
      advancedFilters?.dateRange?.start !== undefined) ||
    (advancedFilters?.dateRange?.end !== null &&
      advancedFilters?.dateRange?.end !== undefined) ||
    (advancedFilters?.priceRange !== "" &&
      advancedFilters?.priceRange !== undefined) ||
    (advancedFilters?.duration !== "" &&
      advancedFilters?.duration !== undefined);

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {serviceCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button> */}
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {/* <span>
            Total de serviços cadastrados:{" "}
            <strong>{filteredServicesCount}</strong>
          </span> */}
          {hasActiveFilters && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span>Filtros ativos:</span>
                {searchTerm && (
                  <Badge variant="secondary">Busca: {searchTerm}</Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary">
                    Categoria:{" "}
                    {
                      serviceCategories.find(
                        (cat) => cat.value === categoryFilter
                      )?.label
                    }
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary">
                    Status: {statusFilter === "active" ? "Ativos" : "Inativos"}
                  </Badge>
                )}
                {advancedFilters?.dateRange?.start && (
                  <Badge variant="secondary">
                    Data início:{" "}
                    {new Date(
                      advancedFilters.dateRange.start
                    ).toLocaleDateString("pt-BR")}
                  </Badge>
                )}
                {advancedFilters?.dateRange?.end && (
                  <Badge variant="secondary">
                    Data fim:{" "}
                    {new Date(advancedFilters.dateRange.end).toLocaleDateString(
                      "pt-BR"
                    )}
                  </Badge>
                )}
                {advancedFilters?.priceRange && (
                  <Badge variant="secondary">
                    Preço:{" "}
                    {advancedFilters.priceRange === "0-100"
                      ? "Até R$ 100"
                      : advancedFilters.priceRange === "100-300"
                      ? "R$ 100 - R$ 300"
                      : advancedFilters.priceRange === "300-500"
                      ? "R$ 300 - R$ 500"
                      : advancedFilters.priceRange === "500-1000"
                      ? "R$ 500 - R$ 1.000"
                      : advancedFilters.priceRange === "1000+"
                      ? "Acima de R$ 1.000"
                      : ""}
                  </Badge>
                )}
                {advancedFilters?.duration && (
                  <Badge variant="secondary">
                    Duração:{" "}
                    {advancedFilters.duration === "0-30"
                      ? "Até 30min"
                      : advancedFilters.duration === "30-60"
                      ? "30-60min"
                      : advancedFilters.duration === "60-90"
                      ? "60-90min"
                      : advancedFilters.duration === "90-120"
                      ? "90-120min"
                      : advancedFilters.duration === "120+"
                      ? "Mais de 120min"
                      : ""}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs h-auto p-1"
                >
                  Limpar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;
