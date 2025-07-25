import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Helper para capitalizar a primeira letra
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
import {
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CalendarClock,
  Briefcase,
  User,
  Zap,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddEmployeeDialog } from "@/components/funcionarios/AddEmployeeDialog";
import ServiceFormDialog from "@/components/servicos/ServiceFormDialog";
import {
  AddAppointmentDialog,
  AppointmentProfileDialog,
} from "@/components/agenda";
import {
  dashboardService,
  DashboardStats,
  TodayAppointment,
  NextAppointment,
} from "@/services/dashboardService";
import { employeeService } from "@/services/employeeService";
import { serviceService } from "@/services/servicesService";
import { patientService } from "@/services/patientService";
import { useDashboard } from "@/context/DashboardContext";

export function Dashboard() {
  const navigate = useNavigate();
  const {
    stats,
    todayAppointments,
    nextAppointment,
    activeEmployees,
    activeServices,
    loading,
    fetchDashboardData,
  } = useDashboard();

  const todayStats = [
    {
      title: "Consultas Agendadas",
      value: stats.totalAppointments,
      icon: Calendar,
      change: { value: "", type: "increase" as const },
    },
    {
      title: "Pacientes Ativos",
      value: stats.totalPatients,
      icon: Users,
      change: { value: "", type: "increase" as const },
    },
    {
      title: "Funcionários Ativos",
      value: activeEmployees,
      icon: UserCheck,
      change: { value: "", type: "increase" as const },
    },
    {
      title: "Serviços Ativos",
      value: activeServices,
      icon: Briefcase,
      change: { value: "", type: "increase" as const },
    },
  ];

  // Estados para paginação
  const [appointmentsPage, setAppointmentsPage] = useState(0);
  const APPOINTMENTS_PER_PAGE = 5;

  // Estados para abrir os modais
  const [openAppointmentsDialog, setOpenAppointmentsDialog] = useState(false);
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [openAddAppointmentDialog, setOpenAddAppointmentDialog] =
    useState(false);

  // Estado para dialog de detalhes da consulta
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [profileDialogLoading, setProfileDialogLoading] = useState(false);
  const [profileDialogAppointment, setProfileDialogAppointment] =
    useState(null);
  const [profileDialogPatients, setProfileDialogPatients] = useState([]);
  const [profileDialogEmployees, setProfileDialogEmployees] = useState([]);
  const [profileDialogServices, setProfileDialogServices] = useState([]);

  // Filtra apenas as consultas do dia atual
  const today = new Date();
  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const onlyTodayAppointments = todayAppointments.filter((appointment) => {
    const apptDate = new Date(appointment.appointmentAt);
    return isSameDay(apptDate, today);
  });

  // Ordena as consultas do mais cedo para o mais tarde
  const now = new Date();
  const sortedAppointments = [...onlyTodayAppointments]
    .filter((a) => new Date(a.appointmentAt) >= now)
    .sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt));

  // Pega apenas as 5 próximas do dia
  const paginatedAppointments = sortedAppointments.slice(
    0,
    APPOINTMENTS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Dialog: Detalhes da Consulta (fora do Card para controle correto) */}
      <AppointmentProfileDialog
        appointment={profileDialogAppointment}
        open={openProfileDialog}
        onClose={() => setOpenProfileDialog(false)}
        patients={profileDialogPatients}
        employees={profileDialogEmployees}
        services={profileDialogServices}
        onSave={async () => {
          setOpenProfileDialog(false);
        }}
      />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua clínica odontológica
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Próxima Consulta + Ações Rápidas */}
        <div className="h-full flex flex-col space-y-4">
          {/* Próxima Consulta - destaque equilibrado */}
          <Card className="shadow-card flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-500" />
                Próxima Consulta
              </CardTitle>
              <CardDescription>
                {nextAppointment
                  ? `Próxima consulta ${nextAppointment.timeUntil}`
                  : "Nenhuma consulta agendada"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex items-center">
              {nextAppointment ? (
                <div
                  className="w-full flex flex-row items-center gap-6 p-5 rounded-xl border border-blue-200 cursor-pointer shadow-md transition-shadow hover:shadow-lg bg-blue-50 bg-opacity-40"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setProfileDialogLoading(true);
                    setOpenProfileDialog(true);
                    try {
                      const [patients, employees, services] = await Promise.all(
                        [
                          patientService.getAllPatients(),
                          employeeService.getAllEmployees(),
                          serviceService.getAllServices(),
                        ]
                      );
                      const patient =
                        patients.find(
                          (p) => p.fullName === nextAppointment.patientName
                        ) || null;
                      const employee =
                        employees.find(
                          (e) => e.fullName === nextAppointment.employeeName
                        ) || null;
                      const service =
                        services.find(
                          (s) => s.name === nextAppointment.serviceName
                        ) || null;
                      let appointmentEnd = nextAppointment.appointmentAt;
                      if (
                        nextAppointment.appointmentAt &&
                        nextAppointment.durationMinutes
                      ) {
                        const start = new Date(nextAppointment.appointmentAt);
                        const end = new Date(
                          start.getTime() +
                            nextAppointment.durationMinutes * 60000
                        );
                        appointmentEnd = end.toISOString();
                      }
                      const appointment = {
                        ...nextAppointment,
                        patient,
                        employee,
                        service,
                        appointmentAt: nextAppointment.appointmentAt,
                        appointmentEnd,
                        status: nextAppointment.status || "Agendado",
                      };
                      setProfileDialogAppointment(appointment);
                      setProfileDialogPatients(
                        patients.map((p) => ({
                          id: p.id,
                          fullName: p.fullName,
                          phone: p.phone,
                        }))
                      );
                      setProfileDialogEmployees(
                        employees.map((e) => ({
                          id: e.id,
                          fullName: e.fullName,
                        }))
                      );
                      setProfileDialogServices(
                        services.map((s) => ({
                          id: s.id,
                          name: s.name,
                          durationMinutes: s.durationMinutes,
                        }))
                      );
                    } catch (e) {
                      // erro ao buscar dados
                    } finally {
                      setProfileDialogLoading(false);
                    }
                  }}
                >
                  {/* Avatar */}
                  {/* <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg"> */}
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-end gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {nextAppointment.patientName}
                      </h3>
                      {nextAppointment.patientAge !== undefined && (
                        <span className="text-sm text-gray-500 font-medium">
                          {nextAppointment.patientAge} anos
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                        {nextAppointment.serviceName}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold">
                        {nextAppointment.durationMinutes} min
                      </span>
                    </div>
                    {nextAppointment.employeeName && (
                      <p className="text-xs text-gray-700 mb-1">
                        Dr(a).{" "}
                        <span className="font-semibold">
                          {nextAppointment.employeeName}
                        </span>
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-2 px-2 py-1 bg-gray-900 text-white rounded-lg shadow-sm">
                        <Clock className="w-3 h-3 text-blue-300" />
                        <span className="text-xs font-medium">
                          {capitalizeFirstLetter(
                            new Date(
                              nextAppointment.appointmentAt
                            ).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                            })
                          )}{" "}
                          às{" "}
                          {new Date(
                            nextAppointment.appointmentAt
                          ).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      Nenhuma consulta agendada
                    </h3>
                    <p className="text-sm text-gray-600">
                      Não há consultas futuras no momento
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas - abaixo */}
          <Card className="shadow-card flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Funcionalidades principais</CardDescription>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  size="sm"
                  className="h-12 px-3 justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={() => setOpenAddAppointmentDialog(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Agendar Consulta</span>
                </Button>
                <Button
                  size="sm"
                  className="h-12 px-3 justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={() => setOpenAddEmployeeDialog(true)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  <span>Novo Funcionário</span>
                </Button>
                <Button
                  size="sm"
                  className="h-12 px-3 justify-start bg-blue-600 hover:bg-blue-700"
                  onClick={() => setOpenServiceFormDialog(true)}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>Novo Serviço</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultas de Hoje - Segunda coluna */}
        <Card className="shadow-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Próximas Consultas de Hoje
            </CardTitle>
            <CardDescription>
              Exibindo as {paginatedAppointments.length} próximas consultas do
              dia
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1 h-[600px] overflow-y-auto">
              {paginatedAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patientName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.serviceName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      {new Date(appointment.appointmentAt).toLocaleTimeString(
                        "pt-BR",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.employeeName
                        ? `com Dr(a). ${appointment.employeeName}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
              {/* Preenche com placeholders invisíveis para manter altura e espaçamento */}
              {Array.from({
                length: APPOINTMENTS_PER_PAGE - paginatedAppointments.length,
              }).map((_, idx) => (
                <div
                  key={"placeholder-appointment-" + idx}
                  className="opacity-0 select-none pointer-events-none"
                >
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg" />
                      <div>
                        <p className="font-medium">&nbsp;</p>
                        <p className="text-sm">&nbsp;</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">&nbsp;</p>
                      <p className="text-sm">&nbsp;</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {todayAppointments.length > APPOINTMENTS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-2">
                {/* <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Anterior"
                  onClick={() => setAppointmentsPage((p) => Math.max(0, p - 1))}
                  disabled={appointmentsPage === 0}
                >
                  <span className="sr-only">Anterior</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 18l-6-6 6-6"
                    />
                  </svg>
                </Button>
                <span className="text-xs text-muted-foreground italic">
                  Mostrando {appointmentsPage * APPOINTMENTS_PER_PAGE + 1}-
                  {Math.min(
                    (appointmentsPage + 1) * APPOINTMENTS_PER_PAGE,
                    todayAppointments.length
                  )}{" "}
                  de {todayAppointments.length} consultas
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Próxima"
                  onClick={() =>
                    setAppointmentsPage((p) =>
                      p + 1 <
                      Math.ceil(
                        todayAppointments.length / APPOINTMENTS_PER_PAGE
                      )
                        ? p + 1
                        : p
                    )
                  }
                  disabled={
                    (appointmentsPage + 1) * APPOINTMENTS_PER_PAGE >=
                    todayAppointments.length
                  }
                >
                  <span className="sr-only">Próxima</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 18l6-6-6-6"
                    />
                  </svg>
                </Button> */}
              </div>
            )}
            <div className="mt-4">
              <Button
                size="sm"
                className="w-full mt-auto"
                variant="link"
                onClick={() => navigate("/agenda")}
              >
                Ver Agenda Completa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Nova Consulta */}
      <AddAppointmentDialog
        open={openAddAppointmentDialog}
        onOpenChange={setOpenAddAppointmentDialog}
        onAddAppointment={() => setOpenAddAppointmentDialog(false)}
      />

      {/* Dialog: Agenda Completa */}
      <Dialog
        open={openAppointmentsDialog}
        onOpenChange={setOpenAppointmentsDialog}
      >
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Agenda Completa</DialogTitle>
            <DialogDescription>
              Veja todas as consultas de hoje
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 mt-2">
            {sortedAppointments.map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.patientName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.serviceName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">
                    {new Date(appointment.appointmentAt).toLocaleTimeString(
                      "pt-BR",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointment.employeeName
                      ? `Dr(a). ${appointment.employeeName}`
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Novo Funcionário */}
      <AddEmployeeDialog
        isOpen={openAddEmployeeDialog}
        onClose={() => setOpenAddEmployeeDialog(false)}
        onEmployeeAdded={() => {
          setOpenAddEmployeeDialog(false);
          // Aqui você pode adicionar lógica para atualizar a lista de funcionários
        }}
      />

      {/* Dialog: Novo Serviço */}
      <ServiceFormDialog
        isOpen={openServiceFormDialog}
        onOpenChange={setOpenServiceFormDialog}
        title="Novo Serviço"
        formData={{
          name: "",
          description: "",
          price: "",
          duration: "",
          category: "",
          isActive: true,
        }}
        onFormDataChange={() => {}}
        onSubmit={() => {
          setOpenServiceFormDialog(false);
          // Aqui você pode adicionar lógica para salvar o serviço
        }}
        onCancel={() => setOpenServiceFormDialog(false)}
        submitLabel="Criar Serviço"
      />
    </div>
  );
}
