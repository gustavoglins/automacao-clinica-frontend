import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Calendar } from "lucide-react";
import type { Employee } from "@/types/employee";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cadastrados no sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Em atividade na clínica
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Funcionários Inativos</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{inactiveEmployees}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Suspensos ou desligados
          </p>
          {inactiveEmployees > 0 && (
            <Badge variant="outline" className="text-orange-600 mt-2">
              Requer atenção
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Escalados Hoje</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{workingToday}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Trabalhando em {todayName === 'Dom' ? 'Domingo' :
              todayName === 'Seg' ? 'Segunda-feira' :
                todayName === 'Ter' ? 'Terça-feira' :
                  todayName === 'Qua' ? 'Quarta-feira' :
                    todayName === 'Qui' ? 'Quinta-feira' :
                      todayName === 'Sex' ? 'Sexta-feira' : 'Sábado'}
          </p>
          {workingToday > 0 && (
            <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 mt-2">
              Equipe presente
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
