import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Filter } from "lucide-react";

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
  { value: "preventivo", label: "Preventivo" },
  { value: "restaurador", label: "Restaurador" },
  { value: "ortodontia", label: "Ortodontia" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "estetico", label: "Estético" },
  { value: "emergencia", label: "Emergência" }
];

const priceRanges = [
  { value: "0-100", label: "Até R$ 100" },
  { value: "100-300", label: "R$ 100 - R$ 300" },
  { value: "300-500", label: "R$ 300 - R$ 500" },
  { value: "500-1000", label: "R$ 500 - R$ 1.000" },
  { value: "1000+", label: "Acima de R$ 1.000" }
];

const durationRanges = [
  { value: "0-30", label: "Até 30 minutos" },
  { value: "30-60", label: "30 - 60 minutos" },
  { value: "60-90", label: "60 - 90 minutos" },
  { value: "90-120", label: "90 - 120 minutos" },
  { value: "120+", label: "Mais de 120 minutos" }
];

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApplyFilters
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
      duration: duration === "all" ? "" : duration
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
          </DialogTitle>
          <DialogDescription>
            Configure filtros avançados para refinar sua busca por serviços
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoria
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {serviceCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Faixa de Preço */}
          <div className="space-y-2">
            <Label htmlFor="priceRange" className="text-sm font-medium">
              Faixa de Preço
            </Label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma faixa de preço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os preços</SelectItem>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duração */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Duração do Serviço
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as durações</SelectItem>
                {durationRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
