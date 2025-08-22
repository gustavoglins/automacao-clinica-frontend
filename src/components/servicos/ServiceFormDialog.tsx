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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  X,
  Check,
  Stethoscope,
  DollarSign,
  Clock,
  FileText,
} from 'lucide-react';
import { Service } from '@/types/service';

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  isActive: boolean;
}

import { CreateServiceData } from '@/types/service';

interface ServiceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  onSubmit: (serviceData: CreateServiceData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const serviceCategories = [
  { value: 'clinico_geral', label: 'Clínico Geral' },
  { value: 'ortodontia', label: 'Ortodontia' },
  { value: 'endodontia', label: 'Endodontia' },
  { value: 'implantodontia', label: 'Implantodontia' },
  { value: 'periodontia', label: 'Periodontia' },
  { value: 'proteses', label: 'Próteses' },
  { value: 'odontopediatria', label: 'Odontopediatria' },
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'radiologia', label: 'Radiologia' },
  { value: 'estetica', label: 'Estética' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'outros', label: 'Outros' },
];

const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Cadastrar Serviço',
}) => {
  const updateFormData = (
    field: keyof ServiceFormData,
    value: string | boolean
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {title.includes('Novo')
              ? 'Preencha as informações para criar um novo serviço'
              : 'Edite as informações do serviço'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            // Monta o objeto CreateServiceData
            const serviceData = {
              name: formData.name,
              category: formData.category,
              description: formData.description,
              durationMinutes: Number(formData.duration),
              price: Number(formData.price),
              active: formData.isActive,
            };
            try {
              // Aguarda a ação do pai (criar/editar). Se for síncrona, resolve imediatamente.
              await Promise.resolve(onSubmit(serviceData));
              // Fecha o diálogo ao concluir com sucesso (reforço de fechamento)
              onOpenChange(false);
            } catch (err) {
              // O tratamento de erro/toast é feito no chamador; aqui apenas não fechamos.
            }
          }}
          className="space-y-6 mt-6"
        >
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="w-5 h-5 text-primary" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Ex: Consulta de Rotina"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Preço e Duração */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Preço e Duração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => updateFormData('duration', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="25">25 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="35">35 minutos</SelectItem>
                      <SelectItem value="40">40 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="55">55 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="70">70 minutos</SelectItem>
                      <SelectItem value="80">80 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                      <SelectItem value="100">100 minutos</SelectItem>
                      <SelectItem value="110">110 minutos</SelectItem>
                      <SelectItem value="120">120 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrição e Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Descrição e Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData('description', e.target.value)
                  }
                  placeholder="Descreva o serviço..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    updateFormData('isActive', checked)
                  }
                />
                <Label htmlFor="isActive">Serviço ativo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
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
              disabled={
                loading ||
                !formData.name ||
                !formData.category ||
                !formData.price ||
                !formData.duration
              }
              className="min-w-[120px] flex items-center gap-2"
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

export default ServiceFormDialog;
