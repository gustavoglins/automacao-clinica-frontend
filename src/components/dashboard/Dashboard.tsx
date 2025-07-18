import React, { useState } from "react"
import {
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCheck,
  Briefcase
} from "lucide-react"
import { StatsCard } from "./StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function Dashboard() {
  const todayStats = [
    {
      title: "Consultas Hoje",
      value: 12,
      icon: Calendar,
      change: { value: "+2", type: "increase" as const }
    },
    {
      title: "Pacientes Ativos",
      value: 1247,
      icon: Users,
      change: { value: "+45", type: "increase" as const }
    },
    {
      title: "Receita Mensal",
      value: "R$ 45.890",
      icon: DollarSign,
      change: { value: "+12%", type: "increase" as const }
    },
    {
      title: "Taxa de Comparecimento",
      value: "89%",
      icon: UserCheck,
      change: { value: "+3%", type: "increase" as const }
    }
  ]

  const todayAppointments = [
    { time: "10:30", patient: "Carlos Santos", type: "Avaliação", doctor: "Dra. Ana" },
    { time: "09:00", patient: "Maria Silva", type: "Limpeza", doctor: "Dr. João" },
    { time: "14:00", patient: "Ana Costa", type: "Tratamento Canal", doctor: "Dr. João" },
    { time: "15:30", patient: "Pedro Lima", type: "Implante", doctor: "Dr. Roberto" },
    { time: "15:30", patient: "Pedro Lima", type: "Implante", doctor: "Dr. Roberto" },
    { time: "15:30", patient: "Pedro Lima", type: "Implante", doctor: "Dr. Roberto" },
    { time: "15:30", patient: "Pedro Lima", type: "Implante", doctor: "Dr. Roberto" },
  ]

  const registeredTasks = [
    { task: "Confirmar consultas de amanhã", priority: "high" },
    { task: "Atualizar prontuário - Maria Silva", priority: "medium" },
    { task: "Enviar orçamento - Carlos Santos", priority: "high" },
    { task: "Reagendar consulta cancelada", priority: "low" },
    { task: "Reagendar consulta cancelada", priority: "low" },
    { task: "Reagendar consulta cancelada", priority: "low" },
    { task: "Reagendar consulta cancelada", priority: "low" },
    { task: "Reagendar consulta cancelada", priority: "low" },
    { task: "Reagendar consulta cancelada", priority: "low" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive'
      case 'medium':
        return 'text-warning'
      default:
        return 'text-muted-foreground'
    }
  }

  // Estados para paginação
  const [appointmentsPage, setAppointmentsPage] = useState(0)
  const [tasksPage, setTasksPage] = useState(0)
  const APPOINTMENTS_PER_PAGE = 5
  const TASKS_PER_PAGE = 7

  // Estados para abrir os modais
  const [openAppointmentsDialog, setOpenAppointmentsDialog] = useState(false)
  const [openTasksDialog, setOpenTasksDialog] = useState(false)

  // Ordena as consultas do mais cedo para o mais tarde
  const sortedAppointments = [...todayAppointments].sort((a, b) => a.time.localeCompare(b.time))

  const paginatedAppointments = sortedAppointments.slice(
    appointmentsPage * APPOINTMENTS_PER_PAGE,
    (appointmentsPage + 1) * APPOINTMENTS_PER_PAGE
  )
  const paginatedTasks = registeredTasks.slice(
    tasksPage * TASKS_PER_PAGE,
    (tasksPage + 1) * TASKS_PER_PAGE
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
        {/* Today's Appointments */}
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
              className="space-y-4 flex-1 min-h-[320px]"
              style={{ minHeight: "260px" }} // Altura para 5 itens de consulta
            >
              {paginatedAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient}</p>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">{appointment.time}</p>
                    <p className="text-sm text-gray-600">{appointment.doctor}</p>
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

        {/* Pending Tasks */}
        <Card className="shadow-card h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-green-500" />
              Tarefas Registradas
            </CardTitle>
            <CardDescription>
              {registeredTasks.length} tarefas registradas hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div
              className="space-y-4 flex-1 min-h-[320px]"
              style={{ minHeight: "364px" }} // Altura para 7 itens de tarefa
            >
              {paginatedTasks.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-destructive' :
                      item.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                      }`} />
                    <p className="text-sm text-gray-900">{item.task}</p>
                  </div>
                  <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                    {item.priority === 'high' ? 'ALTA' :
                      item.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                  </span>
                </div>
              ))}
              {/* Preenche com placeholders invisíveis para manter altura e espaçamento */}
              {Array.from({ length: TASKS_PER_PAGE - paginatedTasks.length }).map((_, idx) => (
                <div key={"placeholder-task-" + idx} className="opacity-0 select-none pointer-events-none">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" />
                      <p className="text-sm">&nbsp;</p>
                    </div>
                    <span className="text-xs font-medium">&nbsp;</span>
                  </div>
                </div>
              ))}
            </div>
            {registeredTasks.length > TASKS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Anterior"
                  onClick={() => setTasksPage((p) => Math.max(0, p - 1))}
                  disabled={tasksPage === 0}
                >
                  <span className="sr-only">Anterior</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
                </Button>
                <span className="text-xs text-muted-foreground italic">
                  Mostrando {tasksPage * TASKS_PER_PAGE + 1}
                  -{Math.min((tasksPage + 1) * TASKS_PER_PAGE, registeredTasks.length)} de {registeredTasks.length} tarefas
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Próxima"
                  onClick={() => setTasksPage((p) =>
                    (p + 1) < Math.ceil(registeredTasks.length / TASKS_PER_PAGE) ? p + 1 : p
                  )}
                  disabled={(tasksPage + 1) * TASKS_PER_PAGE >= registeredTasks.length}
                >
                  <span className="sr-only">Próxima</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
                </Button>
              </div>
            )}
            <div className="mt-4">
              <Button size="sm" className="w-full mt-auto" variant="outline-primary" onClick={() => setOpenTasksDialog(true)}>
                Ver Todas as Tarefas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="sm" className="h-auto p-4 flex-col gap-2" variant="primary">
              <UserCheck className="w-6 h-6" />
              <span>Novo Funcionário</span>
            </Button>
            <Button size="sm" className="h-auto p-4 flex-col gap-2" variant="primary">
              <Calendar className="w-6 h-6" />
              <span>Agendar Consulta</span>
            </Button>
            <Button size="sm" className="h-auto p-4 flex-col gap-2" variant="primary">
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
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">{appointment.time}</p>
                  <p className="text-sm text-gray-600">{appointment.doctor}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Todas as Tarefas */}
      <Dialog open={openTasksDialog} onOpenChange={setOpenTasksDialog}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Todas as Tarefas</DialogTitle>
            <DialogDescription>Veja todas as tarefas registradas hoje</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 mt-2">
            {registeredTasks.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-destructive' :
                    item.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                    }`} />
                  <p className="text-sm text-gray-900">{item.task}</p>
                </div>
                <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  {item.priority === 'high' ? 'ALTA' :
                    item.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}