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
import { X, Check, Building2, FileText, Phone, Mail } from 'lucide-react';
import { CreateConvenioData } from '@/types/convenio';

interface ConvenioFormData {
  nome: string;
  abrangencia: string;
  tipo_cobertura: string;
  telefone_contato: string;
  email_contato: string;
  observacoes: string;
  ativo: boolean;
}

interface ConvenioFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: ConvenioFormData;
  onFormDataChange: (data: ConvenioFormData) => void;
  onSubmit: (data: CreateConvenioData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

export const ConvenioFormDialog: React.FC<ConvenioFormDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Salvar Convênio',
}) => {
  const updateFormData = (
    field: keyof ConvenioFormData,
    value: string | boolean
  ) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {title.includes('Novo')
              ? 'Preencha as informações do novo convênio'
              : 'Edite as informações do convênio'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data: CreateConvenioData = {
              nome: formData.nome,
              abrangencia: formData.abrangencia,
              tipo_cobertura: formData.tipo_cobertura,
              telefone_contato: formData.telefone_contato || undefined,
              email_contato: formData.email_contato || undefined,
              observacoes: formData.observacoes || undefined,
              ativo: formData.ativo,
            };
            onSubmit(data);
          }}
          className="space-y-6 mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => updateFormData('nome', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abrangencia">Abrangência *</Label>
                  <Input
                    id="abrangencia"
                    value={formData.abrangencia}
                    onChange={(e) =>
                      updateFormData('abrangencia', e.target.value)
                    }
                    placeholder="Ex: Nacional, Regional (Sul e Sudeste)"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_cobertura">Tipo de Cobertura *</Label>
                <Input
                  id="tipo_cobertura"
                  value={formData.tipo_cobertura}
                  onChange={(e) =>
                    updateFormData('tipo_cobertura', e.target.value)
                  }
                  placeholder="Ex: Odontológico, Médico-Odontológico"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Contato e Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone_contato">Telefone</Label>
                  <Input
                    id="telefone_contato"
                    value={formData.telefone_contato}
                    onChange={(e) =>
                      updateFormData('telefone_contato', e.target.value)
                    }
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_contato">Email</Label>
                  <Input
                    id="email_contato"
                    type="email"
                    value={formData.email_contato}
                    onChange={(e) =>
                      updateFormData('email_contato', e.target.value)
                    }
                    placeholder="contato@exemplo.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    updateFormData('observacoes', e.target.value)
                  }
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) =>
                    updateFormData('ativo', checked)
                  }
                />
                <Label htmlFor="ativo">Convênio ativo</Label>
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
              disabled={
                loading ||
                !formData.nome ||
                !formData.abrangencia ||
                !formData.tipo_cobertura
              }
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
