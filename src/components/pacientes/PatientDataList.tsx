import React from "react";
import { DataList } from "@/components/ui/data-list";
import { PatientCard } from "./PatientCard";
import { Patient } from "@/types/patient";
import { createPatientsFetchData } from "@/lib/dataListUtils";
import { UserRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientDataListProps {
  patients: Patient[];
  onSchedule?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onViewRecord?: (patient: Patient) => void;
  onAddNew?: () => void;
  pagination?: "paged" | "infinite";
  pageSize?: number;
  height?: string;
}

export const PatientDataList: React.FC<PatientDataListProps> = ({
  patients,
  onSchedule,
  onEdit,
  onViewRecord,
  onAddNew,
  pagination = "paged",
  pageSize = 5,
  height = "400px",
}) => {
  const fetchData = createPatientsFetchData(patients);

  const renderPatientItem = (patient: Patient) => (
    <PatientCard
      key={patient.id}
      patient={patient}
      onViewRecord={onViewRecord}
    />
  );

  return (
    <DataList
      title="Lista de Pacientes"
      description="Visualize e gerencie todos os pacientes da clínica"
      fetchData={fetchData}
      renderItem={renderPatientItem}
      pagination={pagination}
      pageSize={pageSize}
      height={height}
      emptyStateIcon={
        <UserRound className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      }
      emptyStateTitle="Nenhum paciente encontrado"
      emptyStateDescription="Nenhum paciente foi cadastrado ainda."
      emptyStateAction={
        onAddNew && (
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Paciente
          </Button>
        )
      }
      onItemSelect={(patient) => {
        // Ação padrão ao clicar no item (opcional)
        if (onViewRecord) {
          onViewRecord(patient);
        }
      }}
    />
  );
};
