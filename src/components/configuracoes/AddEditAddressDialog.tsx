import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { clinicAddressService } from '@/services/clinicAddressService';
import type {
  ClinicAddress,
  CreateClinicAddressInput,
} from '@/types/clinicAddress';
import { ESTADOS_BRASILEIROS } from '@/types/clinicAddress';

interface AddEditAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: ClinicAddress | null;
  onSuccess: () => void;
}

export const AddEditAddressDialog: React.FC<AddEditAddressDialogProps> = ({
  open,
  onOpenChange,
  address,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateClinicAddressInput>({
    logradouro: address?.logradouro || '',
    numero: address?.numero || '',
    complemento: address?.complemento || '',
    bairro: address?.bairro || '',
    cidade: address?.cidade || '',
    estado: address?.estado || '',
    cep: address?.cep || '',
    pontoReferencia: address?.pontoReferencia || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Atualiza o formulário quando o endereço muda (para edição)
  useEffect(() => {
    if (address) {
      setFormData({
        logradouro: address.logradouro || '',
        numero: address.numero || '',
        complemento: address.complemento || '',
        bairro: address.bairro || '',
        cidade: address.cidade || '',
        estado: address.estado || '',
        cep: address.cep || '',
        pontoReferencia: address.pontoReferencia || '',
      });
    } else {
      // Limpa o formulário para novo endereço
      setFormData({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        pontoReferencia: '',
      });
    }
  }, [address]);

  // Limpa o formulário quando o dialog fecha (sem endereço selecionado)
  useEffect(() => {
    if (!open && !address) {
      setFormData({
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        pontoReferencia: '',
      });
    }
  }, [open, address]);

  const handleInputChange = (
    field: keyof CreateClinicAddressInput,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    handleInputChange('cep', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validações básicas
      if (!formData.logradouro.trim()) {
        toast.error('Logradouro é obrigatório');
        return;
      }
      if (!formData.bairro.trim()) {
        toast.error('Bairro é obrigatório');
        return;
      }
      if (!formData.cidade.trim()) {
        toast.error('Cidade é obrigatória');
        return;
      }
      if (!formData.estado) {
        toast.error('Estado é obrigatório');
        return;
      }
      if (!formData.cep.trim()) {
        toast.error('CEP é obrigatório');
        return;
      }

      // Validar formato do CEP
      const cepRegex = /^\d{5}-\d{3}$/;
      if (!cepRegex.test(formData.cep)) {
        toast.error('CEP deve estar no formato 00000-000');
        return;
      }

      if (address?.id) {
        // Atualizar endereço existente
        await clinicAddressService.updateAddress({
          id: address.id,
          ...formData,
        });
        toast.success('Endereço atualizado com sucesso!');
      } else {
        // Criar novo endereço
        await clinicAddressService.createAddress(formData);
        toast.success('Endereço criado com sucesso!');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      toast.error('Erro ao salvar endereço. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {address ? 'Editar Endereço' : 'Novo Endereço'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Logradouro */}
            <div className="md:col-span-2">
              <Label htmlFor="logradouro">Logradouro *</Label>
              <Input
                id="logradouro"
                value={formData.logradouro}
                onChange={(e) =>
                  handleInputChange('logradouro', e.target.value)
                }
                placeholder="Ex: Rua das Flores"
                required
              />
            </div>

            {/* Número */}
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                placeholder="Ex: 123"
              />
            </div>

            {/* Complemento */}
            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                value={formData.complemento}
                onChange={(e) =>
                  handleInputChange('complemento', e.target.value)
                }
                placeholder="Ex: Sala 101"
              />
            </div>

            {/* Bairro */}
            <div>
              <Label htmlFor="bairro">Bairro *</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                placeholder="Ex: Centro"
                required
              />
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleInputChange('cidade', e.target.value)}
                placeholder="Ex: São Paulo"
                required
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleInputChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASILEIROS.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CEP */}
            <div>
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                required
              />
            </div>

            {/* Ponto de Referência */}
            <div className="md:col-span-2">
              <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
              <Textarea
                id="pontoReferencia"
                value={formData.pontoReferencia}
                onChange={(e) =>
                  handleInputChange('pontoReferencia', e.target.value)
                }
                placeholder="Ex: Próximo ao shopping center"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {address ? 'Atualizar' : 'Criar'} Endereço
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
