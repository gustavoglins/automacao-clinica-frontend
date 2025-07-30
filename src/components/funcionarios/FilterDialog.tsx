import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, MapPin, TrendingUp, Filter } from "lucide-react";

interface FilterState {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  role: string;
  specialty: string;
  status: string;
  location: string;
  performance: string;
}

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
}) => {
  const [filters, setFilters] = useState({
    dateRange: {
      start: null as Date | null,
      end: null as Date | null,
    },
    role: "",
    specialty: "",
    status: "",
    location: "",
    performance: "",
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      dateRange: { start: null, end: null },
      role: "",
      specialty: "",
      status: "",
      location: "",
      performance: "",
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Filter className="w-5 h-5" />
            Filtros Avançados
          </DialogTitle>
          <DialogDescription>
            Configure filtros avançados para refinar sua busca por funcionários
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Data de Admissão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Período de Admissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={
                      filters.dateRange.start
                        ? filters.dateRange.start.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          start: e.target.value
                            ? new Date(e.target.value)
                            : null,
                        },
                      }))
                    }
                    placeholder="Selecione a data inicial"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={
                      filters.dateRange.end
                        ? filters.dateRange.end.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          end: e.target.value ? new Date(e.target.value) : null,
                        },
                      }))
                    }
                    placeholder="Selecione a data final"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cargo e Especialidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Cargo e Especialidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Select
                    value={filters.role || undefined}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        role: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os cargos" />
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
                      <SelectItem value="periodontista">
                        Periodontista
                      </SelectItem>
                      <SelectItem value="implantodontista">
                        Implantodontista
                      </SelectItem>
                      <SelectItem value="protesista">Protesista</SelectItem>
                      <SelectItem value="odontopediatra">
                        Odontopediatra
                      </SelectItem>
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
                      <SelectItem value="recepcionista">
                        Recepcionista
                      </SelectItem>
                      <SelectItem value="atendente">Atendente</SelectItem>
                      <SelectItem value="secretaria">Secretária</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="estoquista">Estoquista</SelectItem>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                      <SelectItem value="estagiario">Estagiário</SelectItem>
                      <SelectItem value="suporte_tecnico">
                        Suporte Técnico
                      </SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Select
                    value={filters.specialty || undefined}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        specialty: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as especialidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todas as especialidades
                      </SelectItem>
                      <SelectItem value="clinico_geral">
                        Clínico Geral
                      </SelectItem>
                      <SelectItem value="ortodontista">Ortodontista</SelectItem>
                      <SelectItem value="endodontista">Endodontista</SelectItem>
                      <SelectItem value="implantodontista">
                        Implantodontista
                      </SelectItem>
                      <SelectItem value="periodontista">
                        Periodontista
                      </SelectItem>
                      <SelectItem value="protesista">Protesista</SelectItem>
                      <SelectItem value="odontopediatra">
                        Odontopediatra
                      </SelectItem>
                      <SelectItem value="cirurgiao_buco_maxilo">
                        Cirurgião Buco Maxilo
                      </SelectItem>
                      <SelectItem value="radiologista">Radiologista</SelectItem>
                      <SelectItem value="patologista_bucal">
                        Patologista Bucal
                      </SelectItem>
                      <SelectItem value="dentistica">Dentística</SelectItem>
                      <SelectItem value="estomatologista">
                        Estomatologista
                      </SelectItem>
                      <SelectItem value="disfuncoes_temporomandibulares">
                        Disfunções Temporomandibulares
                      </SelectItem>
                      <SelectItem value="odontogeriatra">
                        Odontogeriatra
                      </SelectItem>
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
                      <SelectItem value="saude_coletiva">
                        Saúde Coletiva
                      </SelectItem>
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
              </div>
            </CardContent>
          </Card>

          {/* Status e Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Status e Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || undefined}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Férias">Férias</SelectItem>
                      <SelectItem value="Licença">Licença</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Select
                    value={filters.location || undefined}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: value === "all" ? "" : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as localizações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as localizações</SelectItem>
                      <SelectItem value="Unidade Centro">
                        Unidade Centro
                      </SelectItem>
                      <SelectItem value="Unidade Zona Norte">
                        Unidade Zona Norte
                      </SelectItem>
                      <SelectItem value="Unidade Zona Sul">
                        Unidade Zona Sul
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Nível de Performance</Label>
                <Select
                  value={filters.performance || undefined}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      performance: value === "all" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os níveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="Excelente">Excelente</SelectItem>
                    <SelectItem value="Bom">Bom</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="classic" onClick={handleClear}>
              Limpar Filtros
            </Button>
            <Button onClick={handleApply}>Aplicar Filtros</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
