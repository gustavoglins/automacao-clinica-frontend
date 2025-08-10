import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLocation, useNavigate } from 'react-router-dom';
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
import EditPatientDialog from '@/components/pacientes/EditPatientDialog';
import { Patient, PatientStatus } from '@/types/patient';
import { patientService } from '@/services/patientService';
import { usePatients } from '@/context/PatientContext';

const Pacientes = () => {
  const [search, setSearch] = useState('');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PatientStatus>(''); // Mantém status, mas não planos
  const [openAllPatientsDialog, setOpenAllPatientsDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [openEditPatientDialog, setOpenEditPatientDialog] = useState(false);
  const [openDeletePatientDialog, setOpenDeletePatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const urlQuery = params.get('q');

  // Efeito para aplicar busca da URL e limpar após redirecionamento
  useEffect(() => {
    if (urlQuery) {
      setSearch(urlQuery);
      // Limpar parâmetro da URL após aplicar o filtro
      navigate('/pacientes', { replace: true });
    }
  }, [urlQuery, navigate]);

  const query = search;

  // Usar contexto global de pacientes
  const { patients, setPatients, loading, fetchPatients } = usePatients();

  // Aplicar filtros
  const safeQuery = query.toLowerCase();
  const searchFiltered = patients.filter((patient) => {
    const name = patient.fullName?.toLowerCase?.() || '';
    const email = patient.email?.toLowerCase?.() || '';
    const phone = patient.phone || '';
    return (
      name.includes(safeQuery) ||
      (email && email.includes(safeQuery)) ||
      (phone && phone.includes(query))
    );
  });

  const filteredPatients = filterStatus
    ? searchFiltered.filter((patient) => patient.status === filterStatus)
    : searchFiltered;

  // Handlers para ações dos pacientes
  const handleSchedule = (patient: Patient) => {
    // Implementar lógica de agendamento
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenProfileDialog(false);
    setOpenEditPatientDialog(true);
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
      // Toast de sucesso/erro já é disparado pelo service
    } catch (error) {
      console.error('Erro ao adicionar paciente:', error);
      // Toast de erro já é disparado pelo service
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
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          onOpenFilters={() => setOpenFilterDialog(true)}
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

        {/* Filter Dialog */}
        <FilterDialog
          open={openFilterDialog}
          onOpenChange={setOpenFilterDialog}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
        />

        {/* Patient Profile Dialog */}
        <PatientProfileDialog
          patient={selectedPatient}
          isOpen={openProfileDialog}
          onClose={() => setOpenProfileDialog(false)}
          onSchedule={handleSchedule}
          onOpenEdit={(patient) => {
            setSelectedPatient(patient);
            setOpenProfileDialog(false);
            setOpenEditPatientDialog(true);
          }}
          onOpenDelete={handleDelete}
          onViewRecord={handleViewRecord}
        />
        <EditPatientDialog
          open={openEditPatientDialog}
          onOpenChange={setOpenEditPatientDialog}
          patient={selectedPatient}
          onEditPatient={async (updatedPatient) => {
            try {
              const updated = await patientService.updatePatient(
                updatedPatient
              );
              setPatients((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
              );
              setOpenEditPatientDialog(false);
              setSelectedPatient(updated);
            } catch (error) {
              console.error('Erro ao atualizar paciente:', error);
            }
          }}
        />

        {/* Delete Patient Dialog */}
        <DeletePatientDialog
          patient={selectedPatient}
          isOpen={openDeletePatientDialog}
          onClose={() => setOpenDeletePatientDialog(false)}
          onPatientDeleted={handlePatientDeleted}
        />

        {/* Add Patient Dialog */}
        <AddPatientDialog
          open={openAddPatientDialog}
          onOpenChange={setOpenAddPatientDialog}
          onAddPatient={async (newPatient) => {
            try {
              const patient = await patientService.createPatient(newPatient);
              setPatients((prev: Patient[]) => [...prev, patient]);
              // Toast de sucesso/erro já é disparado pelo service
            } catch (error) {
              console.error('Erro ao adicionar paciente:', error);
              // Toast de erro já é disparado pelo service
            }
          }}
        />
      </div>
    </AppLayout>
  );
};

export default Pacientes;
