import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { PaymentMethod } from '@/types/paymentMethod';

interface DeletePaymentMethodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  method: PaymentMethod | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeletePaymentMethodDialog: React.FC<
  DeletePaymentMethodDialogProps
> = ({ isOpen, onOpenChange, method, onConfirm, isLoading = false }) => {
  const handleClose = () => onOpenChange(false);
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </div>
          <DialogDescription>
            Esta ação não pode ser desfeita. Deseja remover o método de
            pagamento <strong>{method?.name}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
