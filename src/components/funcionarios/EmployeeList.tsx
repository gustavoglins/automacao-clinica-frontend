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
    <div className="h-[600px] space-y-4 flex flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {displayedEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onOpenProfile={onOpenProfile}
            onOpenEdit={onOpenEdit}
            onOpenDelete={onOpenDelete}
          />
        ))}
      </div>

      {employees.length > 5 && (
        <div className="flex justify-center pt-4 flex-shrink-0">
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
