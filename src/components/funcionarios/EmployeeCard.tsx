import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, User } from "lucide-react";
import type { Employee } from "@/types/employee";
import { formatPhone } from "@/lib/utils";
import { getEmployeeStatusBadge } from "@/lib/badgeUtils";

interface EmployeeCardProps {
  employee: Employee;
  onOpenProfile: (employee: Employee) => void;
  onOpenEdit: (employee: Employee) => void;
  onOpenDelete: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onOpenProfile,
  onOpenEdit,
  onOpenDelete
}) => {
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

  const statusBadge = getEmployeeStatusBadge('ativo');

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{employee.name}</h3>
            <Badge variant={statusBadge.variant} className={statusBadge.className}>
              Ativo
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{employee.role}</span>
            {employee.specialty && (
              <>
                <span>•</span>
                <span>{employee.specialty}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{formatPhone(employee.phone)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>{employee.email}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{calculateWorkTime(employee.hireDate)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="classic"
          onClick={() => onOpenProfile(employee)}
        >
          Ver Perfil
        </Button>
      </div>
    </div>
  );
};
