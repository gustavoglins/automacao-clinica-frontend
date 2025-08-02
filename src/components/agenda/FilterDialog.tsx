import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Filter, Calendar, User, Clock, Activity } from "lucide-react";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    status: string;
    doctor: string;
    timeRange: string;
    service: string;
  }) => void;
  doctors: string[];
}

const appointmentStatuses = [
  { value: "confirmada", label: "Confirmada" },
  { value: "pendente", label: "Pendente" },
  { value: "reagendada", label: "Reagendada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "concluida", label: "Concluída" },
];

const timeRanges = [
  { value: "manha", label: "Manhã (6h - 12h)" },
  { value: "tarde", label: "Tarde (12h - 18h)" },
  { value: "noite", label: "Noite (18h - 22h)" },
];

const serviceTypes = [
  { value: "limpeza", label: "Limpeza" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "restauracao", label: "Restauração" },
  { value: "ortodontia", label: "Ortodontia" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "emergencia", label: "Emergência" },
];

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  doctors,
}) => {
  const [status, setStatus] = useState("all");
  const [doctor, setDoctor] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [service, setService] = useState("all");

  const handleReset = () => {
    setStatus("all");
    setDoctor("all");
    setTimeRange("all");
    setService("all");
  };

  const handleApply = () => {
    onApplyFilters({
      status: status === "all" ? "" : status,
      doctor: doctor === "all" ? "" : doctor,
      timeRange: timeRange === "all" ? "" : timeRange,
      service: service === "all" ? "" : service,
    });
    onClose();
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
            Configure filtros avançados para refinar sua busca na agenda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Status e Profissional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                Status e Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status da Consulta</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {appointmentStatuses.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Profissional</Label>
                  <Select value={doctor} onValueChange={setDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os profissionais" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todos os profissionais
                      </SelectItem>
                      {doctors.map((doc) => (
                        <SelectItem key={doc} value={doc}>
                          {doc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horário e Tipo de Serviço */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Horário e Tipo de Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Período do Dia</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os períodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      {timeRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Serviço</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os serviços" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os serviços</SelectItem>
                      {serviceTypes.map(serv => (
                        <SelectItem key={serv.value} value={serv.value}>
                          {serv.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* <Separator /> */}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Limpar Filtros
            </Button>
            <Button onClick={handleApply}>Aplicar Filtros</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
