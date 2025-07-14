import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  PatientsStats,
  PatientList,
  FilterDialog,
  AllPatientsDialog,
  PatientsFilters,
  PatientProfileDialog,
  AddPatientDialog
} from "@/components/pacientes";
import { Patient, PatientStatus } from "@/types/patient";
import { searchPatients, filterPatientsByStatus } from "@/services/patientService";

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PatientStatus>("");
  const [openAllPatientsDialog, setOpenAllPatientsDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || search;

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "Maria Silva",
      age: 34,
      phone: "(11) 99999-9999",
      email: "maria.silva@email.com",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-25",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 2,
      name: "Carlos Santos",
      age: 45,
      phone: "(11) 88888-8888",
      email: "carlos.santos@email.com",
      lastVisit: "2024-01-10",
      nextVisit: "2024-01-20",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 3,
      name: "Ana Costa",
      age: 28,
      phone: "(11) 77777-7777",
      email: "ana.costa@email.com",
      lastVisit: "2023-12-20",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 4,
      name: "Pedro Lima",
      age: 52,
      phone: "(11) 66666-6666",
      email: "pedro.lima@email.com",
      lastVisit: "2024-01-12",
      nextVisit: "2024-01-22",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 5,
      name: "Juliana Rocha",
      age: 39,
      phone: "(11) 95555-5555",
      email: "juliana.rocha@email.com",
      lastVisit: "2024-01-05",
      nextVisit: "2024-01-18",
      status: "ativo",
      plan: "Bradesco"
    },
    {
      id: 6,
      name: "Rafael Mendes",
      age: 31,
      phone: "(11) 94444-4444",
      email: "rafael.mendes@email.com",
      lastVisit: "2023-12-28",
      nextVisit: null,
      status: "inativo",
      plan: "Particular"
    },
    {
      id: 7,
      name: "Fernanda Alves",
      age: 27,
      phone: "(11) 93333-3333",
      email: "fernanda.alves@email.com",
      lastVisit: "2024-01-09",
      nextVisit: "2024-01-19",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 8,
      name: "Lucas Pereira",
      age: 40,
      phone: "(11) 92222-2222",
      email: "lucas.pereira@email.com",
      lastVisit: "2023-11-15",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 9,
      name: "Camila Fernandes",
      age: 36,
      phone: "(11) 91111-1111",
      email: "camila.fernandes@email.com",
      lastVisit: "2024-01-02",
      nextVisit: "2024-01-17",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 10,
      name: "Thiago Ribeiro",
      age: 49,
      phone: "(11) 90000-0000",
      email: "thiago.ribeiro@email.com",
      lastVisit: "2023-12-10",
      nextVisit: null,
      status: "inativo",
      plan: "Bradesco"
    },
    {
      id: 11,
      name: "Aline Souza",
      age: 33,
      phone: "(11) 98989-8989",
      email: "aline.souza@email.com",
      lastVisit: "2024-01-14",
      nextVisit: "2024-01-26",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 12,
      name: "Diego Martins",
      age: 29,
      phone: "(11) 97878-7878",
      email: "diego.martins@email.com",
      lastVisit: "2023-10-30",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 13,
      name: "Bruna Carvalho",
      age: 42,
      phone: "(11) 96767-6767",
      email: "bruna.carvalho@email.com",
      lastVisit: "2024-01-06",
      nextVisit: "2024-01-16",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 14,
      name: "Gabriel Silva",
      age: 37,
      phone: "(11) 95656-5656",
      email: "gabriel.silva@email.com",
      lastVisit: "2023-09-25",
      nextVisit: null,
      status: "inativo",
      plan: "Bradesco"
    },
    {
      id: 15,
      name: "Isabela Nunes",
      age: 26,
      phone: "(11) 94545-4545",
      email: "isabela.nunes@email.com",
      lastVisit: "2024-01-08",
      nextVisit: "2024-01-21",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 16,
      name: "Rodrigo Teixeira",
      age: 50,
      phone: "(11) 93434-3434",
      email: "rodrigo.teixeira@email.com",
      lastVisit: "2023-12-05",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 17,
      name: "Patrícia Lima",
      age: 38,
      phone: "(11) 92323-2323",
      email: "patricia.lima@email.com",
      lastVisit: "2024-01-11",
      nextVisit: "2024-01-27",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 18,
      name: "Eduardo Costa",
      age: 44,
      phone: "(11) 91212-1212",
      email: "eduardo.costa@email.com",
      lastVisit: "2023-07-10",
      nextVisit: null,
      status: "inativo",
      plan: "Bradesco"
    },
    {
      id: 19,
      name: "Letícia Barros",
      age: 30,
      phone: "(11) 90101-0101",
      email: "leticia.barros@email.com",
      lastVisit: "2024-01-13",
      nextVisit: "2024-01-23",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 20,
      name: "Andréa Melo",
      age: 35,
      phone: "(11) 99090-9090",
      email: "andrea.melo@email.com",
      lastVisit: "2023-11-11",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 21,
      name: "Marcelo Araújo",
      age: 48,
      phone: "(11) 98888-1212",
      email: "marcelo.araujo@email.com",
      lastVisit: "2024-01-07",
      nextVisit: "2024-01-20",
      status: "ativo",
      plan: "Particular"
    }
  ]);

  // Aplicar filtros
  const searchFiltered = searchPatients(patients, query);
  const filteredPatients = filterPatientsByStatus(searchFiltered, filterStatus);

  // Handlers para ações dos pacientes
  const handleSchedule = (patient: Patient) => {
    console.log("Agendar para:", patient.name);
    // Implementar lógica de agendamento
  };

  const handleEdit = (patient: Patient) => {
    console.log("Editar paciente:", patient.name);
    // Implementar lógica de edição
  };

  const handleViewRecord = (patient: Patient) => {
    console.log("Ver prontuário de:", patient.name);
    setSelectedPatient(patient);
    setOpenProfileDialog(true);
  };

  const handleAddPatient = () => {
    setOpenAddPatientDialog(true);
  };

  const handleSavePatient = (newPatient: Omit<Patient, "id">) => {
    const patient: Patient = {
      ...newPatient,
      id: Math.max(...patients.map(p => p.id)) + 1
    };
    setPatients(prev => [...prev, patient]);
    toast.success(`Paciente ${patient.name} adicionado com sucesso!`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie o cadastro e histórico dos pacientes</p>
        </div>

        {/* Stats Cards */}
        <PatientsStats patients={patients} />

        {/* Filters */}
        <PatientsFilters
          search={query}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onOpenFilters={() => setOpenFilterDialog(true)}
          onOpenAddPatient={handleAddPatient}
          filteredPatientsCount={filteredPatients.length}
          totalPatientsCount={patients.length}
        />

        {/* Filter Dialog */}
        <FilterDialog
          open={openFilterDialog}
          onOpenChange={setOpenFilterDialog}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
        />

        {/* Patients List */}
        <PatientList
          patients={filteredPatients}
          onSchedule={handleSchedule}
          onEdit={handleEdit}
          onViewRecord={handleViewRecord}
          onViewAll={() => setOpenAllPatientsDialog(true)}
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
          onAddPatient={handleSavePatient}
        />
      </div>
    </AppLayout>
  );
};

export default Pacientes;