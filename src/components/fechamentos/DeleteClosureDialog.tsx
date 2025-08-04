import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Closure } from '@/types/closure';

interface DeleteClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closure: Closure;
  onDeleteClosure: (id: string) => void;
}

export const DeleteClosureDialog: React.FC<DeleteClosureDialogProps> = ({
  open,
  onOpenChange,
  closure,
  onDeleteClosure,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDeleteClosure(closure.id);
    } catch (error) {
      console.error('Erro ao deletar fechamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return startDate === endDate ? start : `${start} - ${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Atenção: Esta ação não pode ser desfeita
              </h3>
              <p className="text-sm text-red-700">
                O fechamento será removido permanentemente do sistema.
              </p>
            </div>
          </div>

          {/* Closure Details */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Fechamento a ser excluído:
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Nome:</span> {closure.name}
              </p>
              <p>
                <span className="font-medium">Período:</span>{' '}
                {formatDateRange(closure.start_date, closure.end_date)}
              </p>
              {closure.description && (
                <p>
                  <span className="font-medium">Descrição:</span>{' '}
                  {closure.description}
                </p>
              )}
              {closure.is_recurring && (
                <p className="text-blue-600 font-medium">
                  ⚠️ Este é um fechamento recorrente
                </p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
