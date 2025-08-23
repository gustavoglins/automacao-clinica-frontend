import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Calendar,
  Plus,
  Filter,
  Search,
  CalendarSync,
  CalendarCheck2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  CalendarIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  AddAppointmentDialog,
  AppointmentDataList,
  FilterDialog,
  AppointmentProfileDialog,
} from '@/components/agenda';
import { AddEmployeeDialog } from '@/components/funcionarios/AddEmployeeDialog';
import AddPatientDialog from '@/components/pacientes/AddPatientDialog';
import ServiceFormDialog from '@/components/servicos/ServiceFormDialog';
import { toast } from 'sonner';
import { appointmentService } from '@/services/appointmentService';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
} from '@/types/appointment';
import { Patient } from '@/types/patient';
import { Employee } from '@/types/employee';
import { Service } from '@/types/service';
import { patientService } from '@/services/patientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { useAppointments } from '@/context/hooks/useAppointments';

const Agenda = () => {
  const [search, setSearch] = useState('');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openAddAppointmentDialog, setOpenAddAppointmentDialog] =
    useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterTimeRange, setFilterTimeRange] = useState('');
  const [filterService, setFilterService] = useState('');

  // Estados para os dialogs dos atalhos
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);

  // Listener para eventos globais de abrir dialogs (igual ao Dashboard)
  useEffect(() => {
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

  // Estados para controle de data e visualização
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const { appointments, setAppointments, loading, fetchAppointments } =
    useAppointments();

  const [openViewEditDialog, setOpenViewEditDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Fetch dados para dialog
  useEffect(() => {
    if (openViewEditDialog) {
      (async () => {
        setPatients(await patientService.getAllPatients());
        const allEmployees = await employeeService.getAllEmployees();
        // Filtrar apenas funcionários ativos
        const activeEmployees = allEmployees.filter(
          (employee) => employee.status === 'ativo'
        );
        setEmployees(activeEmployees);
        const allServices = await serviceService.getAllServices();
        // Filtrar apenas serviços ativos
        const activeServices = allServices.filter(
          (service) => service.active === true
        );
        setServices(activeServices);
      })();
    }
  }, [openViewEditDialog]);

  const handleUpdateAppointment = async (data: UpdateAppointmentData) => {
    try {
      const updated = await appointmentService.updateAppointment(data);
      setAppointments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setOpenViewEditDialog(false);
      // Toast de sucesso/erro já é disparado pelo service
    } catch (error) {
      // Toast de erro já é disparado pelo service
    }
  };

  // Lista de médicos únicos
  const doctors = Array.from(
    new Set(
      appointments.map(
        (a) => a.employee?.fullName || 'Funcionário não encontrado'
      )
    )
  );

  // Funções utilitárias para navegação de data
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const dates = [];

    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  };

  // Navegação de data
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // Filtros baseados na data selecionada e modo de visualização
  const getFilteredAppointmentsByView = () => {
    let dateFilteredAppointments = appointments;

    if (viewMode === 'day') {
      dateFilteredAppointments = appointments.filter(
        (appointment) =>
          formatDate(new Date(appointment.appointmentAt)) ===
          formatDate(selectedDate)
      );
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(selectedDate);
      const weekDatesStr = weekDates.map((d) => formatDate(d));
      dateFilteredAppointments = appointments.filter((appointment) =>
        weekDatesStr.includes(formatDate(new Date(appointment.appointmentAt)))
      );
    } else if (viewMode === 'month') {
      const monthDates = getMonthDates(selectedDate);
      const monthDatesStr = monthDates.map((d) => formatDate(d));
      dateFilteredAppointments = appointments.filter((appointment) =>
        monthDatesStr.includes(formatDate(new Date(appointment.appointmentAt)))
      );
    }

    // Aplicar filtros adicionais
    return dateFilteredAppointments.filter((appointment) => {
      const term = search.toLowerCase();
      const matchesSearch =
        appointment.patient?.fullName.toLowerCase().includes(term) ||
        appointment.service?.name.toLowerCase().includes(term) ||
        appointment.employee?.fullName.toLowerCase().includes(term);
      const matchesStatus = filterStatus
        ? appointment.status === filterStatus
        : true;
      const matchesDoctor = filterDoctor
        ? appointment.employee?.fullName === filterDoctor
        : true;
      return matchesSearch && matchesStatus && matchesDoctor;
    });
  };

  const filteredAppointments = getFilteredAppointmentsByView();

  // Função para adicionar nova consulta
  const handleAddAppointment = async (
    newAppointment: CreateAppointmentData
  ) => {
    try {
      const appointment = await appointmentService.createAppointment(
        newAppointment
      );
      setAppointments((prev) => [...prev, appointment]);
      setOpenAddAppointmentDialog(false);
      // Toast de sucesso/erro já é disparado pelo service
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      // Toast de erro já é disparado pelo service
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie todas as consultas e horários
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Consultas Agendadas"
            value={appointments.length}
            icon={Calendar}
          />
          <StatsCard
            title="Confirmadas"
            value={
              filteredAppointments.filter((a) => a.status === 'confirmada')
                .length
            }
            icon={CalendarCheck2}
          />
          <StatsCard
            title="Pendentes"
            value={
              filteredAppointments.filter((a) => a.status === 'pendente').length
            }
            icon={CalendarClock}
          />
          <StatsCard
            title="Reagendadas"
            value={
              filteredAppointments.filter((a) => a.status === 'reagendada')
                .length
            }
            icon={CalendarSync}
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, serviço ou médico..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setOpenFilterDialog(true)}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setOpenAddAppointmentDialog(true)}
              >
                <Plus className="w-4 h-4" />
                Nova Consulta
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>
                Mostrando <strong>{filteredAppointments.length}</strong> de{' '}
                <strong>{appointments.length}</strong> consultas
              </span>
              {(search || filterStatus || filterDoctor) && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <span>Filtros ativos</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearch('');
                        setFilterStatus('');
                        setFilterDoctor('');
                      }}
                      className="text-xs h-auto p-1"
                    >
                      Limpar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg w-fit">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('day')}
            className="gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
            className="gap-2"
          >
            <CalendarRange className="w-4 h-4" />
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
            className="gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Mês
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('prev')}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <h2 className="text-xl font-semibold">
            {viewMode === 'day' &&
              selectedDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            {viewMode === 'week' && 'Semana'}
            {viewMode === 'month' &&
              selectedDate.toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate('next')}
            className="gap-2"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de Consultas */}
        <AppointmentDataList
          appointments={filteredAppointments}
          onViewAppointment={(appointment) => {
            setSelectedAppointment(appointment);
            setOpenViewEditDialog(true);
          }}
          onAddNew={() => setOpenAddAppointmentDialog(true)}
          pagination="paged"
          pageSize={8}
          height="600px"
          viewMode={viewMode}
        />

        {/* Dialogs */}
        <FilterDialog
          isOpen={openFilterDialog}
          onClose={() => setOpenFilterDialog(false)}
          onApplyFilters={(filters) => {
            setFilterStatus(filters.status);
            setFilterDoctor(filters.doctor);
            setFilterTimeRange(filters.timeRange);
            setFilterService(filters.service);
          }}
          doctors={doctors}
        />

        <AddAppointmentDialog
          open={openAddAppointmentDialog}
          onOpenChange={setOpenAddAppointmentDialog}
          onAddAppointment={handleAddAppointment}
        />

        <AppointmentProfileDialog
          open={openViewEditDialog}
          onClose={() => setOpenViewEditDialog(false)}
          appointment={selectedAppointment}
          patients={patients}
          employees={employees}
          services={services}
          onSave={handleUpdateAppointment}
        />

        {/* Dialogs para os atalhos */}
        <AddEmployeeDialog
          isOpen={openAddEmployeeDialog}
          onClose={() => setOpenAddEmployeeDialog(false)}
          onEmployeeAdded={async (employeeData) => {
            try {
              await employeeService.createEmployee(employeeData);
              setOpenAddEmployeeDialog(false);
              // Notifica o AddAppointmentDialog para recarregar seus dados
              window.dispatchEvent(
                new CustomEvent('refreshAppointmentDialogData')
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
              await patientService.createPatient(patientData);
              setOpenAddPatientDialog(false);
              // Notifica o AddAppointmentDialog para recarregar seus dados
              window.dispatchEvent(
                new CustomEvent('refreshAppointmentDialogData')
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
              await serviceService.createService(serviceData);
              setOpenServiceFormDialog(false);
              setServiceFormData({
                name: '',
                description: '',
                price: '',
                duration: '',
                category: '',
                isActive: true,
              });
              // Notifica o AddAppointmentDialog para recarregar seus dados
              window.dispatchEvent(
                new CustomEvent('refreshAppointmentDialogData')
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
      </div>
    </AppLayout>
  );
};

export default Agenda;
