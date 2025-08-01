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
  Stethoscope,
  GraduationCap,
  IdCard,
  X,
} from "lucide-react";
import type { Employee } from "@/types/employee";
import {
  formatPhone,
  formatRole,
  formatSpecialty,
  formatStatus,
} from "@/lib/utils";
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
  onOpenDelete,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  if (!employee) return null;

  // Corrigir para usar hiredAt (não hireDate)
  const calculateWorkTime = (hiredAt: string) => {
    const start = new Date(hiredAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "mês" : "meses"}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? "ano" : "anos"}`;
      }
      return `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${
        remainingMonths === 1 ? "mês" : "meses"
      }`;
    }
  };

  // Corrigir para usar hiredAt (não hireDate)
  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "Não informado";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "Não informado";
    return formatPhone(phone);
  };

  // Corrigir para usar fullName
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  };

  const handleViewSchedule = () => {
    setShowCalendar(true);
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
                  {getInitials(employee.fullName)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 truncate">
                  {employee.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant={
                      employee.status === "ativo" ? "success" : "outline"
                    }
                    className={
                      employee.status === "ativo"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        employee.status === "ativo"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    {employee.status.charAt(0).toUpperCase() +
                      employee.status.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    <IdCard className="w-3 h-3 mr-1" />
                    {formatCPF(employee.cpf)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {formatRole(employee.role)}
                  </Badge>
                  {employee.specialty && (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                      <Stethoscope className="w-3 h-3 mr-1" />
                      {formatSpecialty(employee.specialty)}
                    </Badge>
                  )}
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
                className="px-4 text-red-600 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
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
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Email
                    </p>
                    <p className="text-gray-900 font-medium break-all">
                      {employee.email ?? "Não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Telefone
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatPhoneDisplay(employee.phone)}
                    </p>
                  </div>
                </div>
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
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Cargo
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatRole(employee.role)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Especialidade
                    </p>
                    <p className="text-gray-900 font-medium">
                      {employee.specialty
                        ? formatSpecialty(employee.specialty)
                        : "Não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Salário
                    </p>
                    <p className="text-gray-900 font-medium break-all">
                      {typeof employee.salary === "number"
                        ? `R$ ${employee.salary.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : "Não informado"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Data de Contratação
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(employee.hiredAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Tempo na Empresa
                    </p>
                    <p className="text-gray-900 font-medium">
                      {(() => {
                        if (!employee.hiredAt) return "Não informado";
                        const hiredDate = new Date(employee.hiredAt);
                        const now = new Date();
                        if (hiredDate > now) return "Ainda não contratado";
                        return calculateWorkTime(employee.hiredAt);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
