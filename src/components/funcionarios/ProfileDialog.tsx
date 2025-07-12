import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Phone, Mail, Calendar, MapPin, Clock, Edit, Trash2 } from "lucide-react";
import type { Employee } from "@/types/employee";
import { formatPhone } from "@/lib/utils";

interface ProfileDialogProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (employee: Employee) => void;
  onOpenDelete: (employee: Employee) => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-0 pb-8 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Perfil do Funcionário
              </DialogTitle>
              <p className="text-muted-foreground">
                Visualize e gerencie as informações do funcionário
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={() => onOpenEdit(employee)}
                className="min-w-[100px] h-11 font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="default"
                onClick={() => onOpenDelete(employee)}
                className="min-w-[100px] h-11 font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8 pt-2">
          {/* Header com foto e informações principais */}
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl p-6 border border-primary/10">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center shadow-lg border-2 border-primary/20">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">{employee.name}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200">
                      {employee.role}
                    </Badge>
                    {employee.specialty && (
                      <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium border-gray-300">
                        {employee.specialty}
                      </Badge>
                    )}
                    <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1.5 text-sm font-medium hover:bg-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Ativo
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary bg-primary/10 rounded-lg px-3 py-2 w-fit">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Na empresa há {calculateWorkTime(employee.hireDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de informações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações de Contato */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Telefone</p>
                    <p className="text-muted-foreground">{formatPhoneDisplay(employee.phone)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-muted-foreground break-all">{employee.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Profissionais */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  Informações Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {employee.cpf && (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <p className="font-semibold text-foreground">CPF</p>
                      <p className="text-muted-foreground font-mono">{formatCPF(employee.cpf)}</p>
                    </div>
                  )}
                  {employee.registrationNumber && (
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <p className="font-semibold text-foreground">Registro Profissional</p>
                      <p className="text-muted-foreground font-mono">{employee.registrationNumber}</p>
                    </div>
                  )}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <p className="font-semibold text-foreground">Data de Contratação</p>
                    <p className="text-muted-foreground">{formatDate(employee.hireDate)}</p>
                  </div>
                  {employee.salary && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <p className="font-semibold text-foreground">Salário</p>
                      <p className="text-green-700 font-mono font-semibold text-lg">
                        R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Observações (se existir) */}
          {employee.notes && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <p className="text-muted-foreground leading-relaxed">{employee.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
