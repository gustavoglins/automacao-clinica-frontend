import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Trash2,
  FileText,
  Shield,
  CreditCard,
  Briefcase,
  ChevronRight,
  MapPin,
  DollarSign,
  X
} from "lucide-react";
import type { Employee } from "@/types/employee";
import { formatPhone } from "@/lib/utils";
import { getEmployeeStatusBadge, getSpecialtyBadge } from "@/lib/badgeUtils";

interface EmployeeProfileDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (employee: Employee) => void;
  onOpenDelete: (employee: Employee) => void;
}

export const EmployeeProfileDialog: React.FC<EmployeeProfileDialogProps> = ({
  employee,
  isOpen,
  onClose,
  onOpenEdit,
  onOpenDelete
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (!employee) return null;

  const calculateWorkTime = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'ano' : 'anos'}`;
      }
      return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "Não informado";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "Não informado";
    return formatPhone(phone);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const handleViewSchedule = () => {
    setShowCalendar(true);
  };

  // Dados mockados de compromissos - substituir por dados reais do backend
  const mockAppointments = [
    {
      id: 1,
      date: new Date(2025, 0, 15), // 15 de Janeiro
      time: "09:00",
      patient: "Maria Silva",
      type: "Consulta",
      status: "confirmado"
    },
    {
      id: 2,
      date: new Date(2025, 0, 15), // 15 de Janeiro
      time: "14:30",
      patient: "João Santos",
      type: "Limpeza",
      status: "confirmado"
    },
    {
      id: 3,
      date: new Date(2025, 0, 18), // 18 de Janeiro
      time: "10:00",
      patient: "Ana Costa",
      type: "Tratamento",
      status: "pendente"
    }
  ];

  // Verificar se uma data tem compromissos
  const hasAppointments = (date: Date) => {
    return mockAppointments.some(appointment =>
      appointment.date.toDateString() === date.toDateString()
    );
  };

  // Obter compromissos de uma data específica
  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter(appointment =>
      appointment.date.toDateString() === date.toDateString()
    );
  };

  return (
    <>
      {/* Dialog Principal do Perfil */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden">
          {/* Header */}
          <DialogHeader className="px-6 py-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Perfil do Funcionário
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Employee Header */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {getInitials(employee.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 truncate">{employee.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    {employee.role}
                  </Badge>
                  {employee.specialty && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {employee.specialty}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Ativo
                  </Badge>
                  <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-200">
                    <Clock className="w-3 h-3 mr-1" />
                    {calculateWorkTime(employee.hireDate)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => onOpenEdit(employee)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Funcionário
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenDelete(employee)}
                className="px-6 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Separator />

            {/* Contact Details */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium break-all">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Telefone</p>
                    <p className="text-gray-900 font-medium">{formatPhoneDisplay(employee.phone)}</p>
                  </div>
                </div>
                {(employee.cpf || employee.registrationNumber) && (
                  <div className="space-y-4">
                    {employee.cpf && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">CPF</p>
                        <p className="text-gray-900 font-mono font-medium">{formatCPF(employee.cpf)}</p>
                      </div>
                    )}
                    {employee.registrationNumber && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Registro Profissional</p>
                        <p className="text-gray-900 font-mono font-medium">{employee.registrationNumber}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Informações Profissionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Data de Contratação</p>
                    <p className="text-gray-900 font-medium">{formatDate(employee.hireDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Tempo na Empresa</p>
                    <p className="text-gray-900 font-medium">{calculateWorkTime(employee.hireDate)}</p>
                  </div>
                </div>
                {employee.salary && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Salário</p>
                      <p className="text-gray-900 font-bold text-xl font-mono">
                        R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observations */}
            {employee.notes && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Observações
                </h3>
                <p className="text-gray-700 leading-relaxed">{employee.notes}</p>
              </div>
            )}

            <Separator />

            {/* Agenda do Funcionário */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Agenda do Funcionário
              </h3>
              <Button
                variant="outline"
                onClick={handleViewSchedule}
                className="w-full h-12 text-gray-700 border-gray-200 hover:bg-gray-50 justify-start"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Ver Agendamentos do Funcionário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog do Calendário - Separado */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Agenda de {employee.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* Calendar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Calendário</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasAppointments: (date) => hasAppointments(date)
                }}
                modifiersStyles={{
                  hasAppointments: {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="text-sm text-gray-600">
                <p>💙 Datas com compromissos marcados</p>
              </div>
            </div>

            {/* Appointments for selected date */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Compromissos {selectedDate ? `- ${selectedDate.toLocaleDateString('pt-BR')}` : ''}
              </h3>

              {selectedDate && getAppointmentsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate).map((appointment) => (
                    <div key={appointment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{appointment.time}</span>
                        <Badge
                          variant={appointment.status === 'confirmado' ? 'success' : 'warning'}
                          className={appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 font-medium">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum compromisso para esta data</p>
                </div>
              )}

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Resumo</h4>
                <p className="text-sm text-gray-600">
                  Total de compromissos: {mockAppointments.length}
                </p>
                <p className="text-sm text-gray-600">
                  Confirmados: {mockAppointments.filter(a => a.status === 'confirmado').length}
                </p>
                <p className="text-sm text-gray-600">
                  Pendentes: {mockAppointments.filter(a => a.status === 'pendente').length}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
