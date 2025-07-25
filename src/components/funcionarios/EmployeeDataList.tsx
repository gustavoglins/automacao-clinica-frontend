import React from "react";
import { DataList } from "@/components/ui/data-list";
import { EmployeeCard } from "./EmployeeCard";
import { Employee } from "@/types/employee";
import { createEmployeesFetchData } from "@/lib/dataListUtils";
import { UserX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmployeeDataListProps {
  employees: Employee[];
  onOpenProfile?: (employee: Employee) => void;
  onOpenEdit?: (employee: Employee) => void;
  onOpenDelete?: (employee: Employee) => void;
  onAddNew?: () => void;
  pagination?: "paged" | "infinite";
  pageSize?: number;
  height?: string;
}

export const EmployeeDataList: React.FC<EmployeeDataListProps> = ({
  employees,
  onOpenProfile,
  onOpenEdit,
  onOpenDelete,
  onAddNew,
  pagination = "paged",
  pageSize = 5,
  height = "400px",
}) => {
  const fetchData = createEmployeesFetchData(employees);

  const renderEmployeeItem = (employee: Employee) => (
    <EmployeeCard
      key={employee.id}
      employee={employee}
      onOpenProfile={onOpenProfile}
      onOpenEdit={onOpenEdit}
      onOpenDelete={onOpenDelete}
    />
  );

  return (
    <DataList
      title="Lista de Funcionários"
      description="Visualize e gerencie todos os funcionários da clínica"
      fetchData={fetchData}
      renderItem={renderEmployeeItem}
      pagination={pagination}
      pageSize={pageSize}
      height={height}
      emptyStateIcon={
        <UserX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      }
      emptyStateTitle="Nenhum funcionário encontrado"
      emptyStateDescription="Comece adicionando o primeiro funcionário da clínica"
      emptyStateAction={
        onAddNew && (
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Funcionário
          </Button>
        )
      }
      onItemSelect={(employee) => {
        // Ação padrão ao clicar no item (opcional)
        if (onOpenProfile) {
          onOpenProfile(employee);
        }
      }}
    />
  );
};
