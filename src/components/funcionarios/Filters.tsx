import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountBadge } from "@/lib/badgeUtils";

interface FilterState {
  search: string;
  role: string;
  specialty: string;
  showAll: boolean;
  // Filtros avançados
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  status?: string;
  location?: string;
  performance?: string;
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onOpenFilters: () => void;
  onOpenAddEmployee: () => void;
  filteredEmployeesCount: number;
  totalEmployeesCount: number;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFiltersChange,
  onOpenFilters,
  onOpenAddEmployee,
  filteredEmployeesCount,
  totalEmployeesCount
}) => {
  const clearFilters = () => {
    onFiltersChange({
      search: "",
      role: "all",
      specialty: "all",
      showAll: false,
      dateRange: { start: null, end: null },
      status: "",
      location: "",
      performance: ""
    });
  };

  const hasActiveFilters = filters.search ||
    (filters.role && filters.role !== "all") ||
    (filters.specialty && filters.specialty !== "all") ||
    filters.showAll ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) ||
    (filters.status && filters.status !== "") ||
    (filters.location && filters.location !== "") ||
    (filters.performance && filters.performance !== "");
  const countBadge = getCountBadge();

  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionário..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.role}
            onValueChange={(value) => onFiltersChange({ ...filters, role: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="Dentista">Dentista</SelectItem>
              <SelectItem value="Auxiliar">Auxiliar</SelectItem>
              <SelectItem value="Recepcionista">Recepcionista</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.specialty}
            onValueChange={(value) => onFiltersChange({ ...filters, specialty: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas especialidades</SelectItem>
              <SelectItem value="Ortodontia">Ortodontia</SelectItem>
              <SelectItem value="Endodontia">Endodontia</SelectItem>
              <SelectItem value="Periodontia">Periodontia</SelectItem>
              <SelectItem value="Implantodontia">Implantodontia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            onClick={onOpenAddEmployee}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong>{filteredEmployeesCount}</strong> de <strong>{totalEmployeesCount}</strong> funcionários</span>
          {hasActiveFilters && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span>Filtros ativos:</span>
                {filters.search && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Busca: {filters.search}
                  </Badge>
                )}
                {filters.role && filters.role !== "all" && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Cargo: {filters.role}
                  </Badge>
                )}
                {filters.specialty && filters.specialty !== "all" && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Especialidade: {filters.specialty}
                  </Badge>
                )}
                {filters.status && filters.status !== "" && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Status: {filters.status}
                  </Badge>
                )}
                {filters.location && filters.location !== "" && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Localização: {filters.location}
                  </Badge>
                )}
                {filters.performance && filters.performance !== "" && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Performance: {filters.performance}
                  </Badge>
                )}
                {filters.dateRange && (filters.dateRange.start || filters.dateRange.end) && (
                  <Badge variant={countBadge.variant} className={countBadge.className}>
                    Data: {filters.dateRange.start?.toLocaleDateString('pt-BR') || '...'} - {filters.dateRange.end?.toLocaleDateString('pt-BR') || '...'}
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
