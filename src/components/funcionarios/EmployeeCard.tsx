import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, User } from "lucide-react";
import type { Employee } from "@/types/employee";
import {
  formatPhone,
  formatRole,
  formatSpecialty,
  formatStatus,
} from "@/lib/utils";
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
  onOpenDelete,
}) => {
  const calculateWorkTime = (startDate: string) => {
    try {
      const start = new Date(startDate);
      const now = new Date();

      // Verificar se a data é válida
      if (isNaN(start.getTime())) {
        return "Data inválida";
      }

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
    } catch (error) {
      return "Data inválida";
    }
  };

  const statusBadge = getEmployeeStatusBadge(employee.status);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-xl gap-3 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {employee.fullName}
            </h3>
            <Badge
              variant={statusBadge.variant}
              className={`${statusBadge.className} text-xs`}
            >
              {formatStatus(employee.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
            <span>{formatRole(employee.role)}</span>
            {employee.specialty && (
              <>
                <span>•</span>
                <span className="truncate">
                  {formatSpecialty(employee.specialty)}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
              <Phone className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {employee.phone ? formatPhone(employee.phone) : "Não informado"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {employee.email || "Não informado"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{calculateWorkTime(employee.hiredAt)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        <Button
          size="sm"
          variant="classic"
          onClick={() => onOpenProfile(employee)}
          className="text-sm w-full sm:w-auto"
        >
          Ver Perfil
        </Button>
      </div>
    </div>
  );
};
