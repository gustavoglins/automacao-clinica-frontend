import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, X, Save } from 'lucide-react';
import { Closure } from '@/types/closure';

interface EditClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closure: Closure;
  onEditClosure: (closure: Closure) => void;
}

export const EditClosureDialog: React.FC<EditClosureDialogProps> = ({
  open,
  onOpenChange,
  closure,
  onEditClosure,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    type: 'feriado' as Closure['type'],
    is_recurring: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when closure changes
  useEffect(() => {
    if (closure) {
      setFormData({
        name: closure.name,
        description: closure.description || '',
        start_date: closure.start_date,
        end_date: closure.end_date,
        type: closure.type,
        is_recurring: closure.is_recurring,
      });
    }
  }, [closure]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) return;

    setIsLoading(true);
    try {
      const updatedClosure: Closure = {
        ...closure,
        ...formData,
      };
      await onEditClosure(updatedClosure);
    } catch (error) {
      console.error('Erro ao atualizar fechamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: closure.name,
      description: closure.description || '',
      start_date: closure.start_date,
      end_date: closure.end_date,
      type: closure.type,
      is_recurring: closure.is_recurring,
    });
    onOpenChange(false);
  };

  const isFormValid = formData.name && formData.start_date && formData.end_date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Editar Fechamento
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Natal, Férias de Janeiro"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o motivo do fechamento (opcional)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as Closure['type'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="holiday">Feriado</SelectItem>
                <SelectItem value="vacation">Férias</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate}
                required
              />
            </div>
          </div>

          {/* Recorrente */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRecurring: checked === true })
              }
            />
            <Label htmlFor="isRecurring" className="text-sm">
              Recorrente (repetir todos os anos)
            </Label>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
