import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Check, CreditCard, FileText, X } from 'lucide-react';
import { CreatePaymentMethodData } from '@/types/paymentMethod';

interface PaymentMethodFormData {
  name: string;
  description: string;
  active: boolean;
}

interface PaymentMethodFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: PaymentMethodFormData;
  onFormDataChange: (data: PaymentMethodFormData) => void;
  onSubmit: (data: CreatePaymentMethodData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export const PaymentMethodFormDialog: React.FC<
  PaymentMethodFormDialogProps
> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Salvar Método',
}) => {
  const updateFormData = (
    field: keyof PaymentMethodFormData,
    value: string | boolean
  ) => {
    onFormDataChange({ ...formData, [field]: value } as PaymentMethodFormData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {title.includes('Novo')
              ? 'Informe os dados do novo método de pagamento'
              : 'Edite os dados do método de pagamento'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data: CreatePaymentMethodData = {
              name: formData.name,
              description: formData.description || undefined,
              active: formData.active,
            };
            onSubmit(data);
          }}
          className="space-y-6 mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-primary" />
                Informações do Método
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Ex: PIX, Cartão de Crédito"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="active">Ativo</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        updateFormData('active', checked)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData('description', e.target.value)
                  }
                  placeholder="Detalhes adicionais, bandeiras aceitas, prazos etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name}
              className="min-w-[140px] flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
