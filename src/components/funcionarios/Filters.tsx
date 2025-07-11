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

interface FilterState {
  search: string;
  role: string;
  specialty: string;
  showAll: boolean;
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
      role: "",
      specialty: "",
      showAll: false
    });
  };

  const hasActiveFilters = filters.search || filters.role || filters.specialty;

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
            value={filters.role || undefined}
            onValueChange={(value) => onFiltersChange({ ...filters, role: value === "all" ? "" : value })}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="Dentista">Dentista</SelectItem>
              <SelectItem value="Assistente">Assistente</SelectItem>
              <SelectItem value="Recepcionista">Recepcionista</SelectItem>
              <SelectItem value="Gerente">Gerente</SelectItem>
              <SelectItem value="Auxiliar">Auxiliar</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.specialty || undefined}
            onValueChange={(value) => onFiltersChange({ ...filters, specialty: value === "all" ? "" : value })}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as especialidades</SelectItem>
              <SelectItem value="Ortodontia">Ortodontia</SelectItem>
              <SelectItem value="Endodontia">Endodontia</SelectItem>
              <SelectItem value="Periodontia">Periodontia</SelectItem>
              <SelectItem value="Implantodontia">Implantodontia</SelectItem>
              <SelectItem value="Cirurgia Oral">Cirurgia Oral</SelectItem>
              <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="classic"
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
            Adicionar Funcionário
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Mostrando {filteredEmployeesCount} de {totalEmployeesCount} funcionários</span>
          {hasActiveFilters && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span>Filtros ativos:</span>
                {filters.search && (
                  <Badge variant="secondary" className="text-xs">
                    Busca: {filters.search}
                  </Badge>
                )}
                {filters.role && (
                  <Badge variant="secondary" className="text-xs">
                    Cargo: {filters.role}
                  </Badge>
                )}
                {filters.specialty && (
                  <Badge variant="secondary" className="text-xs">
                    Especialidade: {filters.specialty}
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
