import React, { useState } from 'react';
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
import { employeeService } from '@/services/employeeService';
import { toast } from 'sonner';
import {
  applyPhoneMask,
  applyCpfMask,
  onlyNumbers,
  isValidPhone,
  isValidCpf,
  getPhoneInfo,
} from '@/lib/utils';
import { X, Check } from 'lucide-react';

import { CreateEmployeeData } from '@/types/employee';

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: (employeeData: CreateEmployeeData) => void;
}

export const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  onClose,
  onEmployeeAdded,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    role: '',
    specialty: '',
    registrationNumber: '',
    hireDate: '',
    salary: '',
    status: 'ativo',
    visibleOnSchedule: true,
    acceptsOnlineBooking: true,
    showContact: false,
    avatarUrl: '',
    notes: '',
    workDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], // Dias de trabalho padrão
    startHour: '08:00',
    endHour: '18:00',
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      role: '',
      specialty: '',
      registrationNumber: '',
      hireDate: '',
      salary: '',
      status: 'ativo',
      visibleOnSchedule: true,
      acceptsOnlineBooking: true,
      showContact: false,
      avatarUrl: '',
      notes: '',
      workDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      startHour: '08:00',
      endHour: '18:00',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar telefone apenas se preenchido
    if (formData.phone) {
      const phoneInfo = getPhoneInfo(formData.phone);
      if (!phoneInfo.isValid) {
        toast.error(phoneInfo.message);
        return;
      }
    }

    // Validar CPF se fornecido
    if (formData.cpf && !isValidCpf(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }

    setIsLoading(true);

    try {
      // Convert salary to number
      const employeeData = {
        fullName: formData.name,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : '', // Limpar CPF
        role: formData.role,
        status: formData.status,
        specialty: formData.specialty || undefined,
        crmNumber: formData.registrationNumber || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        phone: onlyNumbers(formData.phone), // Salvar apenas os números
        email: formData.email,
        hiredAt: formData.hireDate ? formData.hireDate : null,
        workDays: formData.workDays,
        startHour: formData.startHour,
        endHour: formData.endHour,
      };

      // Validate form data
      const validation = employeeService.validateEmployeeData(employeeData);
      if (!validation.isValid) {
        console.error('❌ Validação falhou:', validation.errors);
        toast.error(validation.errors[0]);
        return;
      }

      onEmployeeAdded(employeeData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('❌ Erro no formulário:', error);
      // Error handling is already done in the service
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | string[]) => {
    if (field === 'phone') {
      // Aplicar máscara de telefone
      const maskedValue = applyPhoneMask(value as string);
      setFormData((prev) => ({ ...prev, [field]: maskedValue }));
    } else if (field === 'cpf') {
      // Aplicar máscara de CPF
      const maskedValue = applyCpfMask(value as string);
      setFormData((prev) => ({ ...prev, [field]: maskedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Novo Funcionário
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para cadastrar um novo funcionário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Cargo *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="diretor">Diretor</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="dentista">Dentista</SelectItem>
                      <SelectItem value="ortodontista">Ortodontista</SelectItem>
                      <SelectItem value="endodontista">Endodontista</SelectItem>
                      <SelectItem value="periodontista">
                        Periodontista
                      </SelectItem>
                      <SelectItem value="implantodontista">
                        Implantodontista
                      </SelectItem>
                      <SelectItem value="protesista">Protesista</SelectItem>
                      <SelectItem value="odontopediatra">
                        Odontopediatra
                      </SelectItem>
                      <SelectItem value="cirurgiao_buco_maxilo">
                        Cirurgião Buco Maxilo
                      </SelectItem>
                      <SelectItem value="higienista">Higienista</SelectItem>
                      <SelectItem value="auxiliar_saude_bucal">
                        Auxiliar Saúde Bucal
                      </SelectItem>
                      <SelectItem value="tecnico_saude_bucal">
                        Técnico Saúde Bucal
                      </SelectItem>
                      <SelectItem value="recepcionista">
                        Recepcionista
                      </SelectItem>
                      <SelectItem value="atendente">Atendente</SelectItem>
                      <SelectItem value="secretaria">Secretária</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="estoquista">Estoquista</SelectItem>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                      <SelectItem value="estagiario">Estagiário</SelectItem>
                      <SelectItem value="suporte_tecnico">
                        Suporte Técnico
                      </SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="rh">RH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={formData.specialty || undefined}
                    onValueChange={(value) =>
                      handleChange('specialty', value === 'none' ? '' : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="clinico_geral">
                        Clínico Geral
                      </SelectItem>
                      <SelectItem value="ortodontista">Ortodontista</SelectItem>
                      <SelectItem value="endodontista">Endodontista</SelectItem>
                      <SelectItem value="implantodontista">
                        Implantodontista
                      </SelectItem>
                      <SelectItem value="periodontista">
                        Periodontista
                      </SelectItem>
                      <SelectItem value="protesista">Protesista</SelectItem>
                      <SelectItem value="odontopediatra">
                        Odontopediatra
                      </SelectItem>
                      <SelectItem value="cirurgiao_buco_maxilo">
                        Cirurgião Buco Maxilo
                      </SelectItem>
                      <SelectItem value="radiologista">Radiologista</SelectItem>
                      <SelectItem value="patologista_bucal">
                        Patologista Bucal
                      </SelectItem>
                      <SelectItem value="dentistica">Dentística</SelectItem>
                      <SelectItem value="estomatologista">
                        Estomatologista
                      </SelectItem>
                      <SelectItem value="disfuncoes_temporomandibulares">
                        Disfunções Temporomandibulares
                      </SelectItem>
                      <SelectItem value="odontogeriatra">
                        Odontogeriatra
                      </SelectItem>
                      <SelectItem value="odontologia_do_trabalho">
                        Odontologia do Trabalho
                      </SelectItem>
                      <SelectItem value="odontologia_legal">
                        Odontologia Legal
                      </SelectItem>
                      <SelectItem value="odontologia_hospitalar">
                        Odontologia Hospitalar
                      </SelectItem>
                      <SelectItem value="odontologia_do_esporte">
                        Odontologia do Esporte
                      </SelectItem>
                      <SelectItem value="necessidades_especiais">
                        Necessidades Especiais
                      </SelectItem>
                      <SelectItem value="ortopedia_funcional">
                        Ortopedia Funcional
                      </SelectItem>
                      <SelectItem value="saude_coletiva">
                        Saúde Coletiva
                      </SelectItem>
                      <SelectItem value="acupuntura_odonto">
                        Acupuntura Odontológica
                      </SelectItem>
                      <SelectItem value="homeopatia_odonto">
                        Homeopatia Odontológica
                      </SelectItem>
                      <SelectItem value="laserterapia">Laserterapia</SelectItem>
                      <SelectItem value="odontologia_estetica">
                        Odontologia Estética
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">Data de Contratação</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleChange('hireDate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Número de Registro</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      handleChange('registrationNumber', e.target.value)
                    }
                    placeholder="CRO, COREM, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="7"
                    width="18"
                    height="12"
                    rx="2"
                    ry="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                  />
                  <line
                    x1="12"
                    y1="11"
                    x2="12"
                    y2="15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário</Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Observações sobre o funcionário..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Horários de Trabalho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Horários de Trabalho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dias de Trabalho *</Label>
                <div className="flex flex-wrap gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(
                    (day) => {
                      const selected = formData.workDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                            selected
                              ? 'bg-primary text-white border-primary shadow'
                              : 'bg-muted text-foreground border-muted-foreground hover:bg-primary/10'
                          }`}
                          onClick={() => {
                            const workDays = formData.workDays.includes(day)
                              ? formData.workDays.filter((d) => d !== day)
                              : [...formData.workDays, day];
                            handleChange('workDays', workDays);
                          }}
                        >
                          {day}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startHour">Hora de Entrada *</Label>
                  <Input
                    id="startHour"
                    type="time"
                    value={formData.startHour}
                    onChange={(e) => handleChange('startHour', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endHour">Hora de Saída *</Label>
                  <Input
                    id="endHour"
                    type="time"
                    value={formData.endHour}
                    onChange={(e) => handleChange('endHour', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !formData.name || !formData.role || !formData.cpf
              }
              className="min-w-[120px] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Cadastrar Funcionário
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
