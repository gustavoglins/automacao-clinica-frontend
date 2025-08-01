import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Calendar as CalendarIcon,
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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  AddAppointmentDialog,
  AppointmentDataList,
  FilterDialog,
  AppointmentProfileDialog,
} from "@/components/agenda";
import { AddEmployeeDialog } from "@/components/funcionarios";
import { ServiceFormDialog } from "@/components/servicos";
import { AddPatientDialog } from "@/components/pacientes";
import { toast } from "sonner";
import { appointmentService } from "@/services/appointmentService";
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
} from "@/types/appointment";
import { Patient } from "@/types/patient";
import { Employee } from "@/types/employee";
import { Service } from "@/types/service";
import { patientService } from "@/services/patientService";
import { employeeService } from "@/services/employeeService";
import { serviceService } from "@/services/servicesService";
import { useAppointments } from "@/context/AppointmentContext";

const Agenda = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openAddAppointmentDialog, setOpenAddAppointmentDialog] =
    useState(false);
  const [openAddPatientDialog, setOpenAddPatientDialog] = useState(false);
  const [openAddServiceDialog, setOpenAddServiceDialog] = useState(false);
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    isActive: true,
  });
  // Escuta evento para abrir o dialog de novo paciente
  useEffect(() => {
    const handlerPatient = () => setOpenAddPatientDialog(true);
    const handlerService = () => setOpenAddServiceDialog(true);
    const handlerEmployee = () => setOpenAddEmployeeDialog(true);
    window.addEventListener("openAddPatientDialog", handlerPatient);
    window.addEventListener("openAddServiceDialog", handlerService);
    window.addEventListener("openAddEmployeeDialog", handlerEmployee);
    return () => {
      window.removeEventListener("openAddPatientDialog", handlerPatient);
      window.removeEventListener("openAddServiceDialog", handlerService);
      window.removeEventListener("openAddEmployeeDialog", handlerEmployee);
    };
  }, []);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterTimeRange, setFilterTimeRange] = useState("");
  const [filterService, setFilterService] = useState("");

  // Estados para controle de data e visualização
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
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
        setEmployees(await employeeService.getAllEmployees());
        setServices(await serviceService.getAllServices());
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
        (a) => a.employee?.fullName || "Funcionário não encontrado"
      )
    )
  );

  // Funções utilitárias para navegação de data
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
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
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  // Filtros baseados na data selecionada e modo de visualização
  const getFilteredAppointmentsByView = () => {
    let dateFilteredAppointments = appointments;

    if (viewMode === "day") {
      dateFilteredAppointments = appointments.filter(
        (appointment) =>
          formatDate(new Date(appointment.appointmentAt)) ===
          formatDate(selectedDate)
      );
    } else if (viewMode === "week") {
      const weekDates = getWeekDates(selectedDate);
      const weekDatesStr = weekDates.map((d) => formatDate(d));
      dateFilteredAppointments = appointments.filter((appointment) =>
        weekDatesStr.includes(formatDate(new Date(appointment.appointmentAt)))
      );
    } else if (viewMode === "month") {
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

  const filteredAppointments = getFilteredAppointmentsByView().sort((a, b) => {
    const dateA = new Date(a.appointmentAt).getTime();
    const dateB = new Date(b.appointmentAt).getTime();
    return dateA - dateB;
  });

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
      console.error("Erro ao agendar consulta:", error);
      // Toast de erro já é disparado pelo service
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Agenda
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie todas as consultas e horários
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatsCard
            title="Consultas Agendadas"
            value={appointments.length}
            icon={CalendarIcon}
          />
          <StatsCard
            title="Confirmadas"
            value={
              filteredAppointments.filter((a) => a.status === "confirmada")
                .length
            }
            icon={CalendarCheck2}
          />
          <StatsCard
            title="Pendentes"
            value={
              filteredAppointments.filter((a) => a.status === "pendente").length
            }
            icon={CalendarClock}
          />
          <StatsCard
            title="Reagendadas"
            value={
              filteredAppointments.filter((a) => a.status === "reagendada")
                .length
            }
            icon={CalendarSync}
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-6 bg-card rounded-lg border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, serviço ou médico..."
                  className="pl-10 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 text-sm"
                  onClick={() => setOpenFilterDialog(true)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 sm:gap-2 text-sm"
                  onClick={() => setOpenAddAppointmentDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Consulta</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {(search || filterStatus || filterDoctor) && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-2">
                      <span>Filtros ativos</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearch("");
                          setFilterStatus("");
                          setFilterDoctor("");
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
        </div>

        {/* Layout com Calendário e Lista */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Calendário */}
          <div className="xl:col-span-1 flex justify-center">
            <Card className="w-full max-w-[400px] max-h-[565px] overflow-auto flex flex-col justify-start">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Calendário
                </CardTitle>
                <CardDescription className="text-sm">
                  Clique em uma data para filtrar as consultas
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 pb-2">
                <div className="border rounded-md p-2 w-full max-w-[340px] bg-white">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    className="w-full"
                    classNames={{
                      months:
                        "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                      month: "space-y-2 w-full flex flex-col",
                      table: "w-full h-full border-collapse space-y-1",
                      head_row: "",
                      row: "w-full mt-2",
                    }}
                    modifiers={{
                      today: isToday,
                      hasAppointments: (date) =>
                        appointments.some(
                          (a) =>
                            formatDate(new Date(a.appointmentAt)) ===
                            formatDate(date)
                        ),
                    }}
                    modifiersClassNames={{
                      hasAppointments: "has-appointment-day",
                    }}
                  />
                  <style>{`
                    .has-appointment-day {
                      position: relative;
                    }
                    .has-appointment-day::after {
                      content: '';
                      position: absolute;
                      left: 50%;
                      top: 70%;
                      transform: translateX(-50%);
                      width: 7px;
                      height: 7px;
                      background: #326dec;
                      border-radius: 50%;
                      pointer-events: none;
                      z-index: 2;
                    }
                  `}</style>
                </div>
                {/* View Mode Selector */}
                <div className="flex items-center justify-center gap-1 w-full p-1 bg-muted rounded-lg">
                  <Button
                    variant={viewMode === "day" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                    className="gap-1 text-xs flex-1 sm:flex-none"
                  >
                    <CalendarDays className="w-3 h-3" />
                    <span className="hidden sm:inline">Dia</span>
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className="gap-1 text-xs flex-1 sm:flex-none"
                  >
                    <CalendarRange className="w-3 h-3" />
                    <span className="hidden sm:inline">Semana</span>
                  </Button>
                  <Button
                    variant={viewMode === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                    className="gap-1 text-xs flex-1 sm:flex-none"
                  >
                    <CalendarIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">Mês</span>
                  </Button>
                </div>
                {/* Navigation */}
                <div className="flex items-center justify-between w-full gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev")}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Anterior
                  </Button>
                  <span className="flex-1 text-center font-medium text-sm">
                    {viewMode === "day" &&
                      selectedDate.toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    {viewMode === "week" &&
                      `Semana de ${selectedDate.toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                      })}`}
                    {viewMode === "month" &&
                      selectedDate.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next")}
                    className="gap-1 text-xs"
                  >
                    Próximo
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Consultas */}
          <div className="xl:col-span-3">
            <AppointmentDataList
              appointments={filteredAppointments}
              onViewAppointment={(appointment) => {
                setSelectedAppointment(appointment);
                setOpenViewEditDialog(true);
              }}
              pagination="paged"
              pageSize={10}
              height="600px"
              getBorderColor={(appointment) => {
                switch (appointment.status) {
                  case "confirmada":
                    return "green";
                  case "pendente":
                    return "gray";
                  case "cancelada":
                  case "reagendada":
                  case "concluida":
                  default:
                    return "blue";
                }
              }}
            />
          </div>
        </div>

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

        <AddPatientDialog
          open={openAddPatientDialog}
          onOpenChange={setOpenAddPatientDialog}
          onAddPatient={async (patientData) => {
            try {
              await patientService.createPatient(patientData);
              setOpenAddPatientDialog(false);
              // Notifica o AddAppointmentDialog para recarregar seus dados
              window.dispatchEvent(
                new CustomEvent("refreshAppointmentDialogData")
              );
              toast.success("Paciente cadastrado com sucesso!");
            } catch (error) {
              console.error("Erro ao criar paciente:", error);
            }
          }}
        />

        <ServiceFormDialog
          isOpen={openAddServiceDialog}
          onOpenChange={setOpenAddServiceDialog}
          title="Novo Serviço"
          formData={serviceFormData}
          onFormDataChange={setServiceFormData}
          onSubmit={async (serviceData) => {
            try {
              await serviceService.createService(serviceData);
              setOpenAddServiceDialog(false);
              setServiceFormData({
                name: "",
                description: "",
                price: "",
                duration: "",
                category: "",
                isActive: true,
              });
              // Notifica o AddAppointmentDialog para recarregar seus dados
              window.dispatchEvent(
                new CustomEvent("refreshAppointmentDialogData")
              );
              toast.success("Serviço cadastrado com sucesso!");
            } catch (error) {
              console.error("Erro ao criar serviço:", error);
            }
          }}
          onCancel={() => setOpenAddServiceDialog(false)}
        />

        <AddEmployeeDialog
          isOpen={openAddEmployeeDialog}
          onClose={() => setOpenAddEmployeeDialog(false)}
          onEmployeeAdded={async (employeeData) => {
            try {
              await employeeService.createEmployeeWithSchedule(employeeData);
              setOpenAddEmployeeDialog(false);
              // Notifica o AddAppointmentDialog para recarregar seus dados
              window.dispatchEvent(
                new CustomEvent("refreshAppointmentDialogData")
              );
            } catch (error) {
              // Error is already handled in the service
            }
          }}
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
      </div>
    </AppLayout>
  );
};

export default Agenda;
