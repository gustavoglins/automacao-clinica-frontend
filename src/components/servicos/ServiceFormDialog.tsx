import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Check, Stethoscope, DollarSign, Clock, FileText } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
  isActive: boolean;
}

interface ServiceFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const serviceCategories = [
  { value: "preventivo", label: "Preventivo" },
  { value: "restaurador", label: "Restaurador" },
  { value: "ortodontia", label: "Ortodontia" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "estetico", label: "Estético" },
  { value: "emergencia", label: "Emergência" }
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
  submitLabel = "Cadastrar Serviço"
}) => {
  const updateFormData = (field: keyof ServiceFormData, value: string | boolean) => {
    onFormDataChange({
      ...formData,
      [field]: value
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
            {title.includes('Novo') ? 'Preencha as informações para criar um novo serviço' : 'Edite as informações do serviço'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6 mt-6">
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
                      {serviceCategories.map(category => (
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
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => updateFormData('duration', e.target.value)}
                    placeholder="30"
                  />
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
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Descreva o serviço..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => updateFormData('isActive', checked)}
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
              disabled={loading || !formData.name || !formData.category || !formData.price}
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
