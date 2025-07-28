import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  PatientsStats,
  PatientDataList,
  FilterDialog,
  AllPatientsDialog,
  PatientsFilters,
  PatientProfileDialog,
  AddPatientDialog,
} from "@/components/pacientes";
import { Patient, PatientStatus } from "@/types/patient";
import { patientService } from "@/services/patientService";
import { usePatients } from "@/context/PatientContext";

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PatientStatus>(""); // Mantém status, mas não planos
  const [openAllPatientsDialog, setOpenAllPatientsDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || search;

  // Usar contexto global de pacientes
  const { patients, setPatients, loading, fetchPatients } = usePatients();

  // Aplicar filtros (sem planos)
  const searchFiltered = patients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(query.toLowerCase()) ||
      (patient.email &&
        patient.email.toLowerCase().includes(query.toLowerCase())) ||
      (patient.phone && patient.phone.includes(query))
  );
  const filteredPatients = filterStatus ? searchFiltered : searchFiltered;

  // Handlers para ações dos pacientes
  const handleSchedule = (patient: Patient) => {
    console.log("Agendar para:", patient.fullName);
    // Implementar lógica de agendamento
  };

  const handleEdit = (patient: Patient) => {
    console.log("Editar paciente:", patient.fullName);
    // Implementar lógica de edição
  };

  const handleViewRecord = (patient: Patient) => {
    console.log("Ver prontuário de:", patient.fullName);
    setSelectedPatient(patient);
    setOpenProfileDialog(true);
  };

  const handleAddPatient = () => {
    setOpenAddPatientDialog(true);
  };

  const handleSavePatient = async (newPatient: Omit<Patient, "id">) => {
    try {
      const patient = await patientService.createPatient(newPatient);
      setPatients((prev) => [...prev, patient]);
      toast.success(`Paciente ${patient.fullName} adicionado com sucesso!`);
    } catch (error) {
      console.error("Erro ao adicionar paciente:", error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Pacientes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie o cadastro e histórico dos pacientes
          </p>
        </div>

        {/* Stats Cards */}
        <PatientsStats patients={patients} />

        {/* Barra de pesquisa e botão de adicionar paciente */}
        <PatientsFilters
          search={query}
          onSearchChange={setSearch}
          filterStatus={""}
          onFilterStatusChange={() => {}}
          onOpenFilters={() => {}}
          onOpenAddPatient={handleAddPatient}
          filteredPatientsCount={filteredPatients.length}
          totalPatientsCount={patients.length}
        />

        {/* Patients List */}
        <PatientDataList
          patients={filteredPatients}
          onViewRecord={handleViewRecord}
          onAddNew={handleAddPatient}
          pagination="paged"
          pageSize={8}
          height="600px"
        />

        {/* All Patients Dialog */}
        <AllPatientsDialog
          open={openAllPatientsDialog}
          onOpenChange={setOpenAllPatientsDialog}
          patients={filteredPatients}
          onSchedule={handleSchedule}
          onEdit={handleEdit}
          onViewRecord={handleViewRecord}
        />

        {/* Patient Profile Dialog */}
        <PatientProfileDialog
          patient={selectedPatient}
          isOpen={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          onSchedule={handleSchedule}
          onEdit={handleEdit}
          onViewRecord={handleViewRecord}
        />

        {/* Add Patient Dialog */}
        <AddPatientDialog
          open={openAddPatientDialog}
          onOpenChange={setOpenAddPatientDialog}
          onAddPatient={async (newPatient) => {
            try {
              const patient = await patientService.createPatient(newPatient);
              setPatients((prev: Patient[]) => [...prev, patient]);
              toast.success(
                `Paciente ${patient.fullName} adicionado com sucesso!`
              );
            } catch (error) {
              console.error("Erro ao adicionar paciente:", error);
            }
          }}
        />
      </div>
    </AppLayout>
  );
};

export default Pacientes;
