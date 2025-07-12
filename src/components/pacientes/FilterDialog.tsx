import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PatientStatus } from "@/types/patient";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterStatus: PatientStatus;
  onFilterStatusChange: (status: PatientStatus) => void;
}

export const FilterDialog = ({
  open,
  onOpenChange,
  filterStatus,
  onFilterStatusChange
}: FilterDialogProps) => {
  const handleClearFilters = () => {
    onFilterStatusChange("");
  };

  const handleApplyFilters = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
          <DialogDescription>Filtre os pacientes por status</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filterStatus}
              onChange={e => onFilterStatusChange(e.target.value as PatientStatus)}
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearFilters}
            >
              Limpar
            </Button>
            <Button
              size="sm"
              variant="classic"
              onClick={handleApplyFilters}
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
