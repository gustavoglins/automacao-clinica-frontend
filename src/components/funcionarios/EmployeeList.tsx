import React from "react";
import { Button } from "@/components/ui/button";
import { EmployeeCard } from "./EmployeeCard";
import type { Employee } from "@/types/employee";

interface EmployeeListProps {
  employees: Employee[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onOpenProfile: (employee: Employee) => void;
  onOpenEdit: (employee: Employee) => void;
  onOpenDelete: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  showAll,
  onToggleShowAll,
  onOpenProfile,
  onOpenEdit,
  onOpenDelete
}) => {
  const displayedEmployees = showAll ? employees : employees.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayedEmployees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onOpenProfile={onOpenProfile}
          onOpenEdit={onOpenEdit}
          onOpenDelete={onOpenDelete}
        />
      ))}

      {employees.length > 5 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onToggleShowAll}
            className="w-full sm:w-auto"
          >
            {showAll ? "Ver Menos" : `Ver Todos (${employees.length})`}
          </Button>
        </div>
      )}
    </div>
  );
};
