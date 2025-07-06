import {
  Calendar,
  Users,
  DollarSign,
  UserCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCheck
} from "lucide-react"
import { StatsCard } from "./StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
    { time: "09:00", patient: "Maria Silva", type: "Limpeza", doctor: "Dr. João" },
    { time: "10:30", patient: "Carlos Santos", type: "Avaliação", doctor: "Dra. Ana" },
    { time: "14:00", patient: "Ana Costa", type: "Tratamento Canal", doctor: "Dr. João" },
    { time: "15:30", patient: "Pedro Lima", type: "Implante", doctor: "Dr. Roberto" },
  ]

  const registeredTasks = [
    { task: "Confirmar consultas de amanhã", priority: "high" },
    { task: "Atualizar prontuário - Maria Silva", priority: "medium" },
    { task: "Enviar orçamento - Carlos Santos", priority: "high" },
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
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Consultas de Hoje
            </CardTitle>
            <CardDescription>
              {todayAppointments.length} consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">{appointment.time}</p>
                  <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              Ver Agenda Completa
            </Button>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-green-500" />
              Tarefas Registradas
            </CardTitle>
            <CardDescription>
              {registeredTasks.length} tarefas registradas hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registeredTasks.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-destructive' :
                    item.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                    }`} />
                  <p className="text-sm text-foreground">{item.task}</p>
                </div>
                <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  {item.priority === 'high' ? 'ALTA' :
                    item.priority === 'medium' ? 'MÉDIA' : 'BAIXA'}
                </span>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              Ver Todas as Tarefas
            </Button>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <Users className="w-6 h-6" />
              <span>Novo Paciente</span>
            </Button>
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <Calendar className="w-6 h-6" />
              <span>Agendar Consulta</span>
            </Button>
            <Button className="h-auto p-4 flex-col gap-2" variant="outline">
              <DollarSign className="w-6 h-6" />
              <span>Registrar Pagamento</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}