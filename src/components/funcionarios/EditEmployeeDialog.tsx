import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { employeeService, type Employee } from '@/services/employeeService';
import { toast } from 'sonner';
import {
  applyPhoneMask,
  applyCpfMask,
  onlyNumbers,
  isValidPhone,
  formatPhone,
  getPhoneInfo,
} from '@/lib/utils';
import { RequiredFieldsNote } from '@/components/ui/required-fields-note';
import {
  UserPen,
  User,
  Phone,
  Briefcase,
  CreditCard,
  FileText,
  Check,
  X,
  Clock,
} from 'lucide-react';

interface EditEmployeeDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
  employeeWorkDays?: number[]; // 0=Dom, 1=Seg, ...
}
export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  employee,
  isOpen,
  onClose,
  onEmployeeUpdated,
  employeeWorkDays,
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
    workDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as string[],
    startHour: '08:00',
    endHour: '18:00',
  });

  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (employee) {
      // Ordem dos botões e mapeamento: [Seg, Ter, Qua, Qui, Sex, Sáb, Dom]
      const diasPadrao = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      let workDays: string[] = [];
      if (Array.isArray(employeeWorkDays) && employeeWorkDays.length > 0) {
        // 0=Dom, 1=Seg, ..., 6=Sáb
        // Para marcar corretamente, converte cada número para a string do botão correspondente
        // 0->Dom, 1->Seg, ..., 6->Sáb
        const mapNumToStr = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        workDays = employeeWorkDays
          .map((n) => mapNumToStr[n] ?? '')
          .filter(Boolean);
      } else if (Array.isArray(employee.workDays)) {
        // fallback para compatibilidade antiga
        const normalizarDia = (dia: string) => {
          const mapa: Record<string, string> = {
            seg: 'Seg',
            segunda: 'Seg',
            'segunda-feira': 'Seg',
            ter: 'Ter',
            terca: 'Ter',
            terça: 'Ter',
            'terça-feira': 'Ter',
            qua: 'Qua',
            quarta: 'Qua',
            'quarta-feira': 'Qua',
            qui: 'Qui',
            quinta: 'Qui',
            'quinta-feira': 'Qui',
            sex: 'Sex',
            sexta: 'Sex',
            'sexta-feira': 'Sex',
            sab: 'Sáb',
            sabado: 'Sáb',
            sábado: 'Sáb',
            dom: 'Dom',
            domingo: 'Dom',
          };
          const key = dia.toLowerCase().replace(/[-_\s]/g, '');
          for (const k in mapa) {
            if (key.startsWith(k)) return mapa[k];
          }
          if (diasPadrao.includes(dia)) return dia;
          return null;
        };
        workDays = employee.workDays
          .map((dia) => normalizarDia(dia))
          .filter((d): d is string => !!d);
      }
      setFormData((prev) => ({
        ...prev,
        name: employee.fullName || '',
        email: employee.email || '',
        phone: formatPhone(employee.phone || ''),
        cpf: applyCpfMask(employee.cpf || ''),
        role: typeof employee.role === 'string' ? employee.role : '',
        specialty: employee.specialty ?? '',
        registrationNumber: employee.crmNumber || '',
        hireDate: employee.hiredAt || '',
        salary: employee.salary?.toString() || '',
        status: employee.status || 'ativo',
        workDays,
        startHour: employee.startHour || '08:00',
        endHour: employee.endHour || '18:00',
      }));
    }
  }, [employee, employeeWorkDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    let phoneValue = null;
    if (formData.phone) {
      const phoneDigits = onlyNumbers(formData.phone);
      if (phoneDigits.length === 11) {
        phoneValue = phoneDigits;
      } else if (phoneDigits.length > 0) {
        toast.error(
          'O telefone deve conter exatamente 11 dígitos (DDD + número).'
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const updatedEmployee = {
        ...employee,
        fullName: formData.name,
        email: formData.email,
        phone: phoneValue,
        cpf: onlyNumbers(formData.cpf),
        role: formData.role,
        specialty: formData.specialty,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        status: formData.status as 'ativo' | 'inativo',
        workDays: formData.workDays,
        startHour: formData.startHour,
        endHour: formData.endHour,
        crmNumber: formData.registrationNumber,
        hiredAt: formData.hireDate ? formData.hireDate : null,
      };

      await employeeService.updateEmployeeWithSchedule(updatedEmployee);
      onEmployeeUpdated();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error('Erro ao atualizar funcionário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean | string[]
  ) => {
    if (field === 'phone') {
      const maskedValue = applyPhoneMask(value as string);
      setFormData((prev) => ({ ...prev, [field]: maskedValue }));
    } else if (field === 'cpf') {
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
            <UserPen className="w-5 h-5 text-blue-600" />
            Editar Funcionário
          </DialogTitle>
          <DialogDescription>
            Edite as informações do funcionário
          </DialogDescription>
          <RequiredFieldsNote />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Informações Pessoais */}
          {/* ...existing code... */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome Completo <span className="text-gray-800">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">
                    CPF <span className="text-gray-800">*</span>
                  </Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="exemplo@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5" />
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Cargo <span className="text-gray-800">*</span>
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select
                    value={
                      typeof formData.specialty === 'string'
                        ? formData.specialty
                        : ''
                    }
                    onValueChange={(value) => handleChange('specialty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acupuntura_odonto">
                        Acupuntura Odonto
                      </SelectItem>
                      <SelectItem value="clinico_geral">
                        Clínico Geral
                      </SelectItem>
                      <SelectItem value="cirurgiao_buco_maxilo">
                        Cirurgião Buco-Maxilo
                      </SelectItem>
                      <SelectItem value="dentistica">Dentística</SelectItem>
                      <SelectItem value="disfuncoes_temporomandibulares">
                        Disfunções Temporomandibulares
                      </SelectItem>
                      <SelectItem value="endodontista">Endodontista</SelectItem>
                      <SelectItem value="estomatologista">
                        Estomatologista
                      </SelectItem>
                      <SelectItem value="homeopatia_odonto">
                        Homeopatia Odonto
                      </SelectItem>
                      <SelectItem value="implantodontista">
                        Implantodontista
                      </SelectItem>
                      <SelectItem value="laserterapia">Laserterapia</SelectItem>
                      <SelectItem value="necessidades_especiais">
                        Necessidades Especiais
                      </SelectItem>
                      <SelectItem value="odontogeriatra">
                        Odontogeriatra
                      </SelectItem>
                      <SelectItem value="odontologia_do_esporte">
                        Odontologia do Esporte
                      </SelectItem>
                      <SelectItem value="odontologia_do_trabalho">
                        Odontologia do Trabalho
                      </SelectItem>
                      <SelectItem value="odontologia_estetica">
                        Odontologia Estética
                      </SelectItem>
                      <SelectItem value="odontologia_hospitalar">
                        Odontologia Hospitalar
                      </SelectItem>
                      <SelectItem value="odontologia_legal">
                        Odontologia Legal
                      </SelectItem>
                      <SelectItem value="odontopediatra">
                        Odontopediatra
                      </SelectItem>
                      <SelectItem value="ortodontista">Ortodontista</SelectItem>
                      <SelectItem value="ortopedia_funcional">
                        Ortopedia Funcional
                      </SelectItem>
                      <SelectItem value="patologista_bucal">
                        Patologista Bucal
                      </SelectItem>
                      <SelectItem value="periodontista">
                        Periodontista
                      </SelectItem>
                      <SelectItem value="protesista">Protesista</SelectItem>
                      <SelectItem value="radiologista">Radiologista</SelectItem>
                      <SelectItem value="saude_coletiva">
                        Saúde Coletiva
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Número de Registro</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      handleChange('registrationNumber', e.target.value)
                    }
                    placeholder="CRO 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-gray-800">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário (R$)</Label>
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

          {/* Horário de Trabalho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Horário de Trabalho
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
                  <Label htmlFor="startHour">
                    Horário de Entrada <span className="text-gray-800">*</span>
                  </Label>
                  <Input
                    id="startHour"
                    type="time"
                    value={formData.startHour}
                    onChange={(e) => handleChange('startHour', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endHour">
                    Horário de Saída <span className="text-gray-800">*</span>
                  </Label>
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

          {/* Card de Observações removido conforme solicitado */}

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
              disabled={isLoading || !formData.name || !formData.role}
              className="min-w-[120px] flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
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
