import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Phone,
  Mail,
  Calendar,
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

  const statusBadge = getEmployeeStatusBadge('ativo');
  const specialtyBadge = getSpecialtyBadge();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Dados do Funcionário
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-white/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Employee Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {getInitials(employee.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{employee.name}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span>Cargo: {employee.role}</span>
                {employee.specialty && (
                  <>
                    <span>•</span>
                    <span>Especialidade: {employee.specialty}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge.variant} className={statusBadge.className}>
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Ativo
                </Badge>
                <Badge variant={specialtyBadge.variant} className={specialtyBadge.className}>
                  {calculateWorkTime(employee.hireDate)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onOpenEdit(employee)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Funcionário
            </Button>
            <Button
              variant="destructive"
              onClick={() => onOpenDelete(employee)}
              className="px-4"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 break-all">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Telefone</p>
                  <p className="text-gray-900">{formatPhoneDisplay(employee.phone)}</p>
                </div>
              </div>
              {employee.cpf && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">CPF</p>
                    <p className="text-gray-900 font-mono">{formatCPF(employee.cpf)}</p>
                  </div>
                  {employee.registrationNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Registro Profissional</p>
                      <p className="text-gray-900 font-mono">{employee.registrationNumber}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Profissionais</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm font-medium text-green-800">Data de Contratação</p>
                  <p className="text-green-700">{formatDate(employee.hireDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Tempo na Empresa</p>
                  <p className="text-green-700 font-medium">{calculateWorkTime(employee.hireDate)}</p>
                </div>
              </div>
              {employee.salary && (
                <div>
                  <p className="text-sm font-medium text-green-800">Salário</p>
                  <p className="text-green-700 font-bold text-lg font-mono">
                    R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Observations */}
          {employee.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 leading-relaxed">{employee.notes}</p>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Agenda do Funcionário</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Histórico Salarial</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Documentos</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Permissões e Acessos</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
