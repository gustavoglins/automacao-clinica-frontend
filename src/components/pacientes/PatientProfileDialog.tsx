import React, { useEffect, useState } from 'react';
import EditPatientDialog from './EditPatientDialog';
import { AddAppointmentDialog } from '@/components/agenda';
import { AddEmployeeDialog } from '@/components/funcionarios/AddEmployeeDialog';
import AddPatientDialog from './AddPatientDialog';
import ServiceFormDialog from '@/components/servicos/ServiceFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Edit,
  Trash2,
  FileText,
  Stethoscope,
  IdCard,
  X,
} from 'lucide-react';
import { Patient } from '@/types/patient';
import { getPatientStatusBadge, getPlanBadge } from '@/lib/badgeUtils';
import { patientService } from '@/services/patientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment } from '@/types/appointment';

interface PatientProfileDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (patient: Patient) => void;
  onOpenEdit: (patient: Patient) => void;
  onOpenDelete: (patient: Patient) => void;
  onViewRecord: (patient: Patient) => void;
}

export const PatientProfileDialog: React.FC<PatientProfileDialogProps> = ({
  patient,
  isOpen,
  onClose,
  onSchedule,
  onOpenEdit,
  onOpenDelete,
  onViewRecord,
}) => {
  const [openAddAppointment, setOpenAddAppointment] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Estados para os dialogs dos atalhos
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);

  // Próxima consulta do paciente
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(
    null
  );
  const [loadingNextAppointment, setLoadingNextAppointment] = useState(false);

  useEffect(() => {
    const loadNext = async () => {
      if (!patient?.id) return;
      setLoadingNextAppointment(true);
      try {
        const appt = await appointmentService.getNextAppointmentForPatient(
          patient.id
        );
        setNextAppointment(appt);
      } catch (e) {
        // erro já notificado no service
      } finally {
        setLoadingNextAppointment(false);
      }
    };
    if (isOpen) {
      loadNext();
    }
  }, [isOpen, patient?.id]);

  // Listener para eventos globais de abrir dialogs (igual ao Dashboard)
  React.useEffect(() => {
    const handlerPatient = () => setOpenAddPatientDialog(true);
    const handlerService = () => setOpenServiceFormDialog(true);
    const handlerEmployee = () => setOpenAddEmployeeDialog(true);

    window.addEventListener('openAddPatientDialog', handlerPatient);
    window.addEventListener('openAddServiceDialog', handlerService);
    window.addEventListener('openAddEmployeeDialog', handlerEmployee);

    return () => {
      window.removeEventListener('openAddPatientDialog', handlerPatient);
      window.removeEventListener('openAddServiceDialog', handlerService);
      window.removeEventListener('openAddEmployeeDialog', handlerEmployee);
    };
  }, []);

  // Estado do formulário de serviço (igual ao Dashboard)
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    isActive: true,
  });

  if (!patient) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'Não informado';
    return phone;
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2);
  };

  const calculateAge = (birthDate?: string) => {
    const date = birthDate || patient.birthDate;
    if (!date) return '-';
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const statusBadge = getPatientStatusBadge(patient.status || '');
  const planBadge = getPlanBadge();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden">
          {/* Header */}
          <DialogHeader className="px-6 py-6 border-b bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Perfil do Paciente
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Patient Header */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {getInitials(patient.fullName)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border rounded-full border-3 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 truncate">
                  {patient.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant="success"
                    className={
                      patient.status === 'ativo'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        patient.status === 'ativo'
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                    {patient.status.charAt(0).toUpperCase() +
                      patient.status.slice(1)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {calculateAge()} anos
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    <IdCard className="w-3 h-3 mr-1" />
                    {formatCPF(patient.cpf)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  {/* <Badge
                    variant="info"
                    className="bg-blue-100 text-blue-800 border-blue-200"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Última visita: {formatDate(patient.lastVisit || "")}
                  </Badge> */}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setOpenAddAppointment(true);
                  onClose();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenEdit(patient)}
                className="px-6 bg-blue-600 hover:bg-blue-700 text-white hover:text-white shadow-sm duration-200 hover:shadow-md"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenDelete(patient)}
                className="px-4 text-red-600 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Separator />

            {/* Próxima Consulta (dinâmico) */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                Próxima Consulta
              </h3>
              {loadingNextAppointment ? (
                <div className="text-sm text-gray-500">Carregando...</div>
              ) : nextAppointment ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-800">
                      {nextAppointment.employee?.fullName || 'Profissional'}
                    </span>
                    <span className="text-green-700 font-medium">
                      {formatDateTime(nextAppointment.appointmentAt)}
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mb-1">
                    {nextAppointment.service?.name || 'Consulta'}
                  </p>
                  {/* Espaço para sala/consultório futuramente */}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Nenhuma consulta futura encontrada
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Email
                    </p>
                    <p className="text-gray-900 font-medium break-all">
                      {patient.email ? patient.email : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Telefone
                    </p>
                    <p className="text-gray-900 font-medium">
                      {patient.phone
                        ? formatPhone(patient.phone)
                        : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            {/* <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                Informações Médicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Próxima Consulta
                    </p>
                    <p className="text-gray-900 font-medium">
                      {nextAppointment
                        ? formatDateTime(nextAppointment.appointmentAt)
                        : 'Não agendada'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Última Visita
                    </p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(patient.lastVisit || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog de Agendar Consulta */}
      {patient && (
        <AddAppointmentDialog
          open={openAddAppointment}
          onOpenChange={setOpenAddAppointment}
          onAddAppointment={async (appointmentData) => {
            await import('@/services/appointmentService').then(
              ({ appointmentService }) =>
                appointmentService.createAppointment(appointmentData)
            );
            setOpenAddAppointment(false);
          }}
          initialPatientId={patient.id}
          initialPhone={patient.phone || ''}
        />
      )}

      {/* Dialogs para os atalhos */}
      <AddEmployeeDialog
        isOpen={openAddEmployeeDialog}
        onClose={() => setOpenAddEmployeeDialog(false)}
        onEmployeeAdded={async (employeeData) => {
          try {
            const newEmployee =
              await employeeService.createEmployeeWithSchedule(employeeData);
            setOpenAddEmployeeDialog(false);
            // Notifica o AddAppointmentDialog para recarregar e selecionar o novo funcionário
            window.dispatchEvent(
              new CustomEvent('newEmployeeCreated', {
                detail: { employeeId: newEmployee.id },
              })
            );
          } catch (error) {
            // Error is already handled in the service
          }
        }}
      />

      <AddPatientDialog
        open={openAddPatientDialog}
        onOpenChange={setOpenAddPatientDialog}
        onAddPatient={async (patientData) => {
          try {
            const newPatient = await patientService.createPatient(patientData);
            setOpenAddPatientDialog(false);
            // Notifica o AddAppointmentDialog para recarregar e selecionar o novo paciente
            window.dispatchEvent(
              new CustomEvent('newPatientCreated', {
                detail: { patientId: newPatient.id },
              })
            );
          } catch (error) {
            console.error('Erro ao criar paciente:', error);
          }
        }}
      />

      <ServiceFormDialog
        isOpen={openServiceFormDialog}
        onOpenChange={setOpenServiceFormDialog}
        title="Novo Serviço"
        formData={serviceFormData}
        onFormDataChange={setServiceFormData}
        onSubmit={async (serviceData) => {
          try {
            const newService = await serviceService.createService(serviceData);
            setOpenServiceFormDialog(false);
            setServiceFormData({
              name: '',
              description: '',
              price: '',
              duration: '',
              category: '',
              isActive: true,
            });
            // Notifica o AddAppointmentDialog para recarregar e selecionar o novo serviço
            window.dispatchEvent(
              new CustomEvent('newServiceCreated', {
                detail: { serviceId: newService.id },
              })
            );
          } catch (error) {
            console.error('Erro ao criar serviço:', error);
          }
        }}
        onCancel={() => {
          setOpenServiceFormDialog(false);
          setServiceFormData({
            name: '',
            description: '',
            price: '',
            duration: '',
            category: '',
            isActive: true,
          });
        }}
        submitLabel="Criar Serviço"
      />
    </>
  );
};
