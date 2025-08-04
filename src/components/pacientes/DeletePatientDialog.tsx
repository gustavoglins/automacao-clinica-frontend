import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types/patient';
import { toast } from 'sonner';

interface DeletePatientDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onPatientDeleted: () => void;
}

export const DeletePatientDialog: React.FC<DeletePatientDialogProps> = ({
  patient,
  isOpen,
  onClose,
  onPatientDeleted,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!patient) return;

    setIsLoading(true);
    try {
      await patientService.deletePatient(patient.id);
      onPatientDeleted();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast.error('Erro ao excluir paciente');
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
            paciente <strong>{patient?.fullName}</strong> e todos os seus dados
            associados.
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
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
