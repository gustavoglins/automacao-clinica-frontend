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
  totalEmployeesCount,
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
      performance: "",
    });
  };

  const hasActiveFilters =
    filters.search ||
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
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="pl-10"
            />
          </div>
          {/* Filtro de status */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                status: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.role}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, role: value })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="diretor">Diretor</SelectItem>
              <SelectItem value="gerente">Gerente</SelectItem>
              <SelectItem value="coordenador">Coordenador</SelectItem>
              <SelectItem value="dentista">Dentista</SelectItem>
              <SelectItem value="ortodontista">Ortodontista</SelectItem>
              <SelectItem value="endodontista">Endodontista</SelectItem>
              <SelectItem value="periodontista">Periodontista</SelectItem>
              <SelectItem value="implantodontista">Implantodontista</SelectItem>
              <SelectItem value="protesista">Protesista</SelectItem>
              <SelectItem value="odontopediatra">Odontopediatra</SelectItem>
              <SelectItem value="cirurgiao_buco_maxilo">
                Cirurgião Buco Maxilo
              </SelectItem>
              <SelectItem value="higienista">Higienista</SelectItem>
              <SelectItem value="auxiliar_saude_bucal">
                Auxiliar Saúde Bucal
              </SelectItem>
              <SelectItem value="tecnico_saude_bucal">
                Técnico Saúde Bucal
              </SelectItem>
              <SelectItem value="recepcionista">Recepcionista</SelectItem>
              <SelectItem value="atendente">Atendente</SelectItem>
              <SelectItem value="secretaria">Secretária</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="estoquista">Estoquista</SelectItem>
              <SelectItem value="limpeza">Limpeza</SelectItem>
              <SelectItem value="estagiario">Estagiário</SelectItem>
              <SelectItem value="suporte_tecnico">Suporte Técnico</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="rh">RH</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.specialty}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, specialty: value })
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas especialidades</SelectItem>
              <SelectItem value="clinico_geral">Clínico Geral</SelectItem>
              <SelectItem value="ortodontista">Ortodontista</SelectItem>
              <SelectItem value="endodontista">Endodontista</SelectItem>
              <SelectItem value="implantodontista">Implantodontista</SelectItem>
              <SelectItem value="periodontista">Periodontista</SelectItem>
              <SelectItem value="protesista">Protesista</SelectItem>
              <SelectItem value="odontopediatra">Odontopediatra</SelectItem>
              <SelectItem value="cirurgiao_buco_maxilo">
                Cirurgião Buco Maxilo
              </SelectItem>
              <SelectItem value="radiologista">Radiologista</SelectItem>
              <SelectItem value="patologista_bucal">
                Patologista Bucal
              </SelectItem>
              <SelectItem value="dentistica">Dentística</SelectItem>
              <SelectItem value="estomatologista">Estomatologista</SelectItem>
              <SelectItem value="disfuncoes_temporomandibulares">
                Disfunções Temporomandibulares
              </SelectItem>
              <SelectItem value="odontogeriatra">Odontogeriatra</SelectItem>
              <SelectItem value="odontologia_do_trabalho">
                Odontologia do Trabalho
              </SelectItem>
              <SelectItem value="odontologia_legal">
                Odontologia Legal
              </SelectItem>
              <SelectItem value="odontologia_hospitalar">
                Odontologia Hospitalar
              </SelectItem>
              <SelectItem value="odontologia_do_esporte">
                Odontologia do Esporte
              </SelectItem>
              <SelectItem value="necessidades_especiais">
                Necessidades Especiais
              </SelectItem>
              <SelectItem value="ortopedia_funcional">
                Ortopedia Funcional
              </SelectItem>
              <SelectItem value="saude_coletiva">Saúde Coletiva</SelectItem>
              <SelectItem value="acupuntura_odonto">
                Acupuntura Odontológica
              </SelectItem>
              <SelectItem value="homeopatia_odonto">
                Homeopatia Odontológica
              </SelectItem>
              <SelectItem value="laserterapia">Laserterapia</SelectItem>
              <SelectItem value="odontologia_estetica">
                Odontologia Estética
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {/* Botão de filtros removido */}
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
          <span>
            Total de funcionários cadastrados:{" "}
            <strong>{filteredEmployeesCount}</strong>
          </span>
          {hasActiveFilters && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span>Filtros ativos:</span>
                {filters.search && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Busca: {filters.search}
                  </Badge>
                )}
                {filters.role && filters.role !== "all" && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Cargo: {filters.role}
                  </Badge>
                )}
                {filters.specialty && filters.specialty !== "all" && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Especialidade: {filters.specialty}
                  </Badge>
                )}
                {filters.status && filters.status !== "" && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Status: {filters.status}
                  </Badge>
                )}
                {filters.location && filters.location !== "" && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Localização: {filters.location}
                  </Badge>
                )}
                {filters.performance && filters.performance !== "" && (
                  <Badge
                    variant={countBadge.variant}
                    className={countBadge.className}
                  >
                    Performance: {filters.performance}
                  </Badge>
                )}
                {filters.dateRange &&
                  (filters.dateRange.start || filters.dateRange.end) && (
                    <Badge
                      variant={countBadge.variant}
                      className={countBadge.className}
                    >
                      Data:{" "}
                      {filters.dateRange.start?.toLocaleDateString("pt-BR") ||
                        "..."}{" "}
                      -{" "}
                      {filters.dateRange.end?.toLocaleDateString("pt-BR") ||
                        "..."}
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
