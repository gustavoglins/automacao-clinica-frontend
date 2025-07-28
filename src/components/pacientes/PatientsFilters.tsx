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
import { PatientStatus } from "@/types/patient";
import { getCountBadge } from "@/lib/badgeUtils";

interface PatientsFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  filterStatus: PatientStatus;
  onFilterStatusChange: (status: PatientStatus) => void;
  onOpenFilters: () => void;
  onOpenAddPatient?: () => void;
  filteredPatientsCount: number;
  totalPatientsCount: number;
}

export const PatientsFilters: React.FC<PatientsFiltersProps> = ({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  onOpenFilters,
  onOpenAddPatient,
  filteredPatientsCount,
  totalPatientsCount,
}) => {
  const clearFilters = () => {
    onSearchChange("");
    onFilterStatusChange("");
  };

  const hasActiveFilters = search || filterStatus;
  const countBadge = getCountBadge();

  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAddPatient && (
            <Button
              onClick={onOpenAddPatient}
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Paciente</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong>{filteredPatientsCount}</strong> de{" "}
            <strong>{totalPatientsCount}</strong> pacientes
          </span>
          {hasActiveFilters && (
            <>
              <Separator
                orientation="vertical"
                className="h-4 hidden sm:block"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="hidden sm:inline">Filtros ativos:</span>
                {search && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Busca: {search}
                  </Badge>
                )}
                {filterStatus && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Status: {filterStatus}
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
