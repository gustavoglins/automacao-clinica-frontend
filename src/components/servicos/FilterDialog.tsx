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
import { Filter, Stethoscope, DollarSign, Clock, Activity } from "lucide-react";

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: {
    dateRange: { start: Date | null; end: Date | null };
    category: string;
    status: string;
    priceRange: string;
    duration: string;
  }) => void;
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

const priceRanges = [
  { value: "0-100", label: "Até R$ 100" },
  { value: "100-300", label: "R$ 100 - R$ 300" },
  { value: "300-500", label: "R$ 300 - R$ 500" },
  { value: "500-1000", label: "R$ 500 - R$ 1.000" },
  { value: "1000+", label: "Acima de R$ 1.000" },
];

const durationRanges = [
  { value: "0-30", label: "Até 30 min" },
  { value: "30-60", label: "30 - 60 min" },
  { value: "60-90", label: "1h - 1h30" },
  { value: "90-120", label: "1h30 - 2h" },
  { value: "120+", label: "Mais de 2h" },
];

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
}) => {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [duration, setDuration] = useState("all");

  const handleReset = () => {
    setCategory("all");
    setStatus("all");
    setPriceRange("all");
    setDuration("all");
  };

  const handleApply = () => {
    onApplyFilters({
      dateRange: { start: null, end: null },
      category: category === "all" ? "" : category,
      status: status === "all" ? "" : status,
      priceRange: priceRange === "all" ? "" : priceRange,
      duration: duration === "all" ? "" : duration,
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
            Configure filtros avançados para refinar sua busca por serviços
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Categoria e Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5" />
                Categoria e Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {serviceCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preço e Duração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Preço e Duração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Faixa de Preço</Label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as faixas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as faixas</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duração do Serviço</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as durações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as durações</SelectItem>
                      {durationRanges.map((range) => (
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

          <Separator />

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
