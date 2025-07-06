import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, Clock, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Agenda = () => {
  const appointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Maria Silva",
      service: "Limpeza",
      doctor: "Dr. João",
      status: "confirmada",
      duration: "1h"
    },
    {
      id: 2,
      time: "10:30",
      patient: "Carlos Santos",
      service: "Avaliação",
      doctor: "Dra. Ana",
      status: "pendente",
      duration: "30min"
    },
    {
      id: 3,
      time: "14:00",
      patient: "Ana Costa",
      service: "Tratamento Canal",
      doctor: "Dr. João",
      status: "confirmada",
      duration: "2h"
    },
    {
      id: 4,
      time: "15:30",
      patient: "Pedro Lima",
      service: "Implante",
      doctor: "Dr. Roberto",
      status: "reagendada",
      duration: "1h30min"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reagendada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Gerencie todas as consultas e horários</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline-primary" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Consulta
            </Button>
          </div>
        </div>

        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Hoje - {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardTitle>
            <CardDescription>
              {appointments.length} consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    <p className="text-xs text-muted-foreground">com {appointment.doctor}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold text-primary">{appointment.time}</p>
                  <p className="text-sm text-muted-foreground">{appointment.duration}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline-warning">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline-success">
                      Confirmar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly View Preview */}
        <Card className="shadow-card bg-gradient-card">
          <CardHeader>
            <CardTitle>Visão Semanal</CardTitle>
            <CardDescription>
              Resumo da próxima semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                <div key={day} className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{day}</p>
                  <div className="bg-card rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{index + 15}</p>
                    <p className="text-xs text-primary">{Math.floor(Math.random() * 8) + 2} consultas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Agenda;