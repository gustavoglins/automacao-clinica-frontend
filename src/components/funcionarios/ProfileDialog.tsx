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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Phone, Mail, Calendar, MapPin, Clock, MoreHorizontal } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Perfil do Funcionário</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpenEdit(employee)}>
                  Editar Funcionário
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onOpenDelete(employee)}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com foto e informações básicas */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">{employee.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{employee.role}</Badge>
                {employee.specialty && (
                  <Badge variant="outline">{employee.specialty}</Badge>
                )}
                <Badge className="bg-green-100 text-green-600 hover:bg-green-100">
                  Ativo
                </Badge>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Na empresa há {calculateWorkTime(employee.hireDate)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{formatPhoneDisplay(employee.phone)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {employee.cpf && (
                  <div>
                    <p className="font-medium">CPF</p>
                    <p className="text-sm text-muted-foreground">{formatCPF(employee.cpf)}</p>
                  </div>
                )}
                {employee.registrationNumber && (
                  <div>
                    <p className="font-medium">Registro Profissional</p>
                    <p className="text-sm text-muted-foreground">{employee.registrationNumber}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium">Data de Contratação</p>
                  <p className="text-sm text-muted-foreground">{formatDate(employee.hireDate)}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge variant={employee.status === 'ativo' ? 'default' : 'secondary'}>
                    {employee.status}
                  </Badge>
                </div>
                {employee.salary && (
                  <div>
                    <p className="font-medium">Salário</p>
                    <p className="text-sm text-muted-foreground">R$ {employee.salary.toFixed(2)}</p>
                  </div>
                )}
              </div>
              {employee.notes && (
                <div>
                  <p className="font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground">{employee.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
