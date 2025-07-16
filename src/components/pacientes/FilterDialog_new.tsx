import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Filter, User, Calendar, CreditCard, Activity } from "lucide-react";
import { PatientStatus } from "@/types/patient";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStatus: PatientStatus;
  onFilterStatusChange: (status: PatientStatus) => void;
}

const healthPlans = [
  { value: "particular", label: "Particular" },
  { value: "unimed", label: "Unimed" },
  { value: "amil", label: "Amil" },
  { value: "bradesco", label: "Bradesco" },
  { value: "sulamerica", label: "SulAmérica" },
  { value: "hapvida", label: "Hapvida" },
  { value: "outros", label: "Outros" }
];

const ageRanges = [
  { value: "0-18", label: "0 - 18 anos" },
  { value: "19-30", label: "19 - 30 anos" },
  { value: "31-50", label: "31 - 50 anos" },
  { value: "51-65", label: "51 - 65 anos" },
  { value: "65+", label: "Acima de 65 anos" }
];

export const FilterDialog = ({
  open,
  onOpenChange,
  filterStatus,
  onFilterStatusChange
}: FilterDialogProps) => {
  const [ageRange, setAgeRange] = useState("");
  const [plan, setPlan] = useState("");
  const [lastVisit, setLastVisit] = useState("");

  const handleClearFilters = () => {
    onFilterStatusChange("");
    setAgeRange("");
    setPlan("");
    setLastVisit("");
  };

  const handleApplyFilters = () => {
    // Aqui você pode expandir para aplicar todos os filtros
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Filter className="w-5 h-5" />
            Filtros Avançados
          </DialogTitle>
          <DialogDescription>
            Configure filtros avançados para refinar sua busca por pacientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status e Faixa Etária */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Status e Idade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filterStatus || "all"}
                    onValueChange={(value) => onFilterStatusChange(value === "all" ? "" : value as PatientStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Faixa Etária</Label>
                  <Select value={ageRange || "all"} onValueChange={(value) => setAgeRange(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as idades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as idades</SelectItem>
                      {ageRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Plano de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Plano de Saúde</Label>
                <Select value={plan || "all"} onValueChange={(value) => setPlan(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os planos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    {healthPlans.map(planOption => (
                      <SelectItem key={planOption.value} value={planOption.value}>
                        {planOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Última Visita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Última Visita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Período da Última Visita</Label>
                <Select value={lastVisit || "all"} onValueChange={(value) => setLastVisit(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer período</SelectItem>
                    <SelectItem value="last_week">Última semana</SelectItem>
                    <SelectItem value="last_month">Último mês</SelectItem>
                    <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                    <SelectItem value="last_6_months">Últimos 6 meses</SelectItem>
                    <SelectItem value="last_year">Último ano</SelectItem>
                    <SelectItem value="more_than_year">Mais de 1 ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
