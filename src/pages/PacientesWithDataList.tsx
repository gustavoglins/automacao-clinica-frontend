import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  PatientsStats,
  PatientDataList,
  FilterDialog,
  AllPatientsDialog,
  PatientsFilters,
  PatientProfileDialog,
  DeletePatientDialog,
  AddPatientDialog,
} from '@/components/pacientes';
import { Patient, PatientStatus } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { usePatients } from '@/context';

const PacientesWithDataList = () => {
  const [search, setSearch] = useState('');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PatientStatus>('');
  const [openAllPatientsDialog, setOpenAllPatientsDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [openDeletePatientDialog, setOpenDeletePatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || search;

  // Usar contexto global de pacientes
  const { patients, setPatients, loading, fetchPatients } = usePatients();

  // Aplicar filtros
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
    // Implementar lógica de agendamento
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenProfileDialog(true);
  };

  const handleViewRecord = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenProfileDialog(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenProfileDialog(false);
    setOpenDeletePatientDialog(true);
  };

  const handlePatientDeleted = () => {
    setPatients((prev) => prev.filter((p) => p.id !== selectedPatient?.id));
    setOpenDeletePatientDialog(false);
    setSelectedPatient(null);
  };

  const handleAddPatient = () => {
    setOpenAddPatientDialog(true);
  };

  const handleSavePatient = async (newPatient: Omit<Patient, 'id'>) => {
    try {
      const patient = await patientService.createPatient(newPatient);
      setPatients((prev) => [...prev, patient]);
      toast.success(`Paciente ${patient.fullName} adicionado com sucesso!`);
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro e histórico dos pacientes
          </p>
        </div>

        {/* Stats Cards */}
        <PatientsStats patients={patients} />

        {/* Barra de pesquisa e filtros */}
        <PatientsFilters
          search={query}
          onSearchChange={setSearch}
          filterStatus={''}
          onFilterStatusChange={() => {}}
          onOpenFilters={() => {}}
          onOpenAddPatient={handleAddPatient}
          filteredPatientsCount={filteredPatients.length}
          totalPatientsCount={patients.length}
        />

        {/* DataList de Pacientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista paginada */}
          <PatientDataList
            patients={filteredPatients}
            onViewRecord={handleViewRecord}
            onAddNew={handleAddPatient}
            pagination="paged"
            pageSize={5}
            height="500px"
          />

          {/* Lista com scroll infinito */}
          <PatientDataList
            patients={filteredPatients}
            onViewRecord={handleViewRecord}
            onAddNew={handleAddPatient}
            pagination="infinite"
            pageSize={3}
            height="500px"
          />
        </div>

        {/* Exemplo de diferentes configurações */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Diferentes Configurações do DataList
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Configuração compacta */}
            <PatientDataList
              patients={filteredPatients.slice(0, 10)}
              onViewRecord={handleViewRecord}
              pagination="paged"
              pageSize={3}
              height="300px"
            />

            {/* Configuração média */}
            <PatientDataList
              patients={filteredPatients}
              onViewRecord={handleViewRecord}
              pagination="infinite"
              pageSize={4}
              height="400px"
            />

            {/* Configuração expandida */}
            <PatientDataList
              patients={filteredPatients}
              onViewRecord={handleViewRecord}
              pagination="paged"
              pageSize={8}
              height="600px"
            />
          </div>
        </div>

        {/* Dialogs originais mantidos */}
        <AllPatientsDialog
          open={openAllPatientsDialog}
          onOpenChange={setOpenAllPatientsDialog}
          patients={filteredPatients}
          onSchedule={handleSchedule}
          onEdit={handleEdit}
          onViewRecord={handleViewRecord}
        />

        <PatientProfileDialog
          patient={selectedPatient}
          isOpen={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          onSchedule={handleSchedule}
          onOpenEdit={handleEdit}
          onOpenDelete={handleDelete}
          onViewRecord={handleViewRecord}
        />

        {/* Delete Patient Dialog */}
        <DeletePatientDialog
          patient={selectedPatient}
          isOpen={openDeletePatientDialog}
          onClose={() => setOpenDeletePatientDialog(false)}
          onPatientDeleted={handlePatientDeleted}
        />

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
              console.error('Erro ao adicionar paciente:', error);
            }
          }}
        />
      </div>
    </AppLayout>
  );
};

export default PacientesWithDataList;
