import React, { useState } from "react"
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
  CheckCheck,
  Briefcase,
  User
} from "lucide-react"
import { StatsCard } from "./StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AddEmployeeDialog } from "@/components/funcionarios/AddEmployeeDialog"
import ServiceFormDialog from "@/components/servicos/ServiceFormDialog"
import { AddAppointmentDialog } from "@/components/agenda"
import { dashboardService, DashboardStats, TodayAppointment, NextAppointment } from "@/services/dashboardService"
import { employeeService } from "@/services/employeeService"
import { serviceService } from "@/services/servicesService"
import { useDashboard } from "@/context/DashboardContext";

export function Dashboard() {
  const { stats, todayAppointments, nextAppointment, activeEmployees, activeServices, loading, fetchDashboardData } = useDashboard();

  const todayStats = [
    {
      title: "Consultas Agendadas",
      value: stats.totalAppointments,
      icon: Calendar,
      change: { value: "", type: "increase" as const }
    },
    {
      title: "Pacientes Ativos",
      value: stats.totalPatients,
      icon: Users,
      change: { value: "", type: "increase" as const }
    },
    {
      title: "Funcionários Ativos",
      value: activeEmployees,
      icon: UserCheck,
      change: { value: "", type: "increase" as const }
    },
    {
      title: "Serviços Ativos",
      value: activeServices,
      icon: Briefcase,
      change: { value: "", type: "increase" as const }
    }
  ];



  // Estados para paginação
  const [appointmentsPage, setAppointmentsPage] = useState(0)
  const APPOINTMENTS_PER_PAGE = 5

  // Estados para abrir os modais
  const [openAppointmentsDialog, setOpenAppointmentsDialog] = useState(false)
  const [openAddEmployeeDialog, setOpenAddEmployeeDialog] = useState(false)
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false)
  const [openAddAppointmentDialog, setOpenAddAppointmentDialog] = useState(false)

  // Ordena as consultas do mais cedo para o mais tarde
  const sortedAppointments = [...todayAppointments].sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt))

  const paginatedAppointments = sortedAppointments.slice(
    appointmentsPage * APPOINTMENTS_PER_PAGE,
    (appointmentsPage + 1) * APPOINTMENTS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua clínica odontológica</p>
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
        {/* Próxima Consulta - agora em primeiro */}
        <Card className="shadow-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Próxima Consulta
            </CardTitle>
            <CardDescription>
              {nextAppointment ? `Próxima consulta ${nextAppointment.timeUntil}` : 'Nenhuma consulta agendada'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {nextAppointment ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col h-full w-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                      <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-3xl font-bold text-gray-900 mb-1 truncate">{nextAppointment.patientName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{nextAppointment.serviceName}</span>
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{nextAppointment.durationMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-base mb-1">
                        <UserCheck className="w-5 h-5 text-blue-500" />
                        <span>{nextAppointment.employeeName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 text-base">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span>{capitalizeFirstLetter(new Date(nextAppointment.appointmentAt).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }))} às {new Date(nextAppointment.appointmentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-base">
                      <span className="inline-block px-3 py-1 bg-blue-200 text-blue-900 rounded-full text-xs font-semibold capitalize">{nextAppointment.status}</span>
                      <span className="text-xs text-gray-500">{nextAppointment.timeUntil}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma consulta agendada
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Não há consultas futuras no momento
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments - agora em segundo */}
        <Card className="shadow-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Consultas de Hoje
            </CardTitle>
            <CardDescription>
              {todayAppointments.length} consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div
              className="space-y-4 flex-1 h-[600px] overflow-y-auto"
            >
              {paginatedAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">{new Date(appointment.appointmentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-gray-600">{appointment.employeeName}</p>
                  </div>
                </div>
              ))}
              {/* Preenche com placeholders invisíveis para manter altura e espaçamento */}
              {Array.from({ length: APPOINTMENTS_PER_PAGE - paginatedAppointments.length }).map((_, idx) => (
                <div key={"placeholder-appointment-" + idx} className="opacity-0 select-none pointer-events-none">
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
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Anterior"
                  onClick={() => setAppointmentsPage((p) => Math.max(0, p - 1))}
                  disabled={appointmentsPage === 0}
                >
                  <span className="sr-only">Anterior</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
                </Button>
                <span className="text-xs text-muted-foreground italic">
                  Mostrando {appointmentsPage * APPOINTMENTS_PER_PAGE + 1}
                  -{Math.min((appointmentsPage + 1) * APPOINTMENTS_PER_PAGE, todayAppointments.length)} de {todayAppointments.length} consultas
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Próxima"
                  onClick={() => setAppointmentsPage((p) =>
                    (p + 1) < Math.ceil(todayAppointments.length / APPOINTMENTS_PER_PAGE) ? p + 1 : p
                  )}
                  disabled={(appointmentsPage + 1) * APPOINTMENTS_PER_PAGE >= todayAppointments.length}
                >
                  <span className="sr-only">Próxima</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
                </Button>
              </div>
            )}
            <div className="mt-4">
              <Button size="sm" className="w-full mt-auto" variant="outline-primary" onClick={() => setOpenAppointmentsDialog(true)}>
                Ver Agenda Completa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Ações Rápidas
          </CardTitle>
          <CardDescription className="ml-7">
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              size="sm"
              className="h-auto p-4 flex-col gap-2"
              variant="primary"
              onClick={() => setOpenAddAppointmentDialog(true)}
            >
              <Calendar className="w-6 h-6" />
              <span>Agendar Consulta</span>
            </Button>
            {/* Dialog: Nova Consulta */}
            <AddAppointmentDialog
              open={openAddAppointmentDialog}
              onOpenChange={setOpenAddAppointmentDialog}
              onAddAppointment={() => setOpenAddAppointmentDialog(false)}
            />
            <Button
              size="sm"
              className="h-auto p-4 flex-col gap-2"
              variant="primary"
              onClick={() => setOpenAddEmployeeDialog(true)}
            >
              <UserCheck className="w-6 h-6" />
              <span>Novo Funcionário</span>
            </Button>
            <Button
              size="sm"
              className="h-auto p-4 flex-col gap-2"
              variant="primary"
              onClick={() => setOpenServiceFormDialog(true)}
            >
              <Briefcase className="w-6 h-6" />
              <span>Novo Serviço</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Agenda Completa */}
      <Dialog open={openAppointmentsDialog} onOpenChange={setOpenAppointmentsDialog}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Agenda Completa</DialogTitle>
            <DialogDescription>Veja todas as consultas de hoje</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 mt-2">
            {sortedAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{new Date(appointment.appointmentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-sm text-gray-600">{appointment.employeeName}</p>
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
          setOpenAddEmployeeDialog(false)
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
          isActive: true
        }}
        onFormDataChange={() => { }}
        onSubmit={() => {
          setOpenServiceFormDialog(false)
          // Aqui você pode adicionar lógica para salvar o serviço
        }}
        onCancel={() => setOpenServiceFormDialog(false)}
        submitLabel="Criar Serviço"
      />
    </div>
  )
}