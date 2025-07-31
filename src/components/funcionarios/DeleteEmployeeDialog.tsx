import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { employeeService, Employee } from "@/services/employeeService";
import { toast } from "sonner";

interface DeleteEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEmployeeDeleted: () => void;
}

export const DeleteEmployeeDialog: React.FC<DeleteEmployeeDialogProps> = ({
  employee,
  isOpen,
  onClose,
  onEmployeeDeleted,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!employee) return;

    setIsLoading(true);
    try {
      // Use service to delete employee with relations
      await employeeService.deleteEmployeeWithRelations(employee.id);

      onEmployeeDeleted();
      onClose();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Erro ao excluir funcionário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
            funcionário <strong>{employee?.fullName}</strong> e todos os seus
            dados associados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
