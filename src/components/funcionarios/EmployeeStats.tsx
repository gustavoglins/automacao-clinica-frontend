import React from "react";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import type { Employee } from "@/types/employee";
import { formatStatus } from "@/lib/utils";

interface EmployeeStatsProps {
  employees: Employee[];
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ employees }) => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'ativo').length;
  const inactiveEmployees = employees.filter(emp => emp.status !== 'ativo').length;

  // Funcionários que trabalham hoje (verificar dia da semana atual)
  const today = new Date();
  const todayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayName = todayNames[today.getDay()];

  const workingToday = employees.filter(emp =>
    emp.status === 'ativo' &&
    emp.workDays &&
    emp.workDays.includes(todayName)
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard
        title="Total"
        value={totalEmployees}
        icon={Users}
      />
      <StatsCard
        title="Ativos"
        value={activeEmployees}
        icon={UserCheck}
      />
      <StatsCard
        title="Inativos"
        value={inactiveEmployees}
        icon={UserX}
      />
      <StatsCard
        title="Atendendo Hoje"
        value={workingToday}
        icon={Calendar}
      />
    </div>
  );
};
