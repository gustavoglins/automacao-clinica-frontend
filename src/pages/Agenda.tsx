import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, Clock, Plus, Filter, Search, CalendarSync, CalendarCheck2, CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatsCard } from "@/components/dashboard/StatsCard";

const Agenda = () => {
  const [search, setSearch] = useState("");

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

  const filteredAppointments = appointments.filter((appointment) => {
    const term = search.toLowerCase();
    return (
      appointment.patient.toLowerCase().includes(term) ||
      appointment.service.toLowerCase().includes(term) ||
      appointment.doctor.toLowerCase().includes(term)
    );
  });

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

  // Simula o total de consultas na semana (soma dos valores exibidos nos cards dos dias)
  const weekTotals = [
    ...['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(() => Math.floor(Math.random() * 8) + 2)
  ];
  const totalWeekAppointments = weekTotals.reduce((acc, cur) => acc + cur, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Gerencie todas as consultas e horários</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por paciente, serviço ou médico..."
                  className="pl-10"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Button variant="outline-primary" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button variant="primary" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Consulta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Consultas Hoje"
            value={appointments.length}
            icon={Calendar}
          />
          <StatsCard
            title="Confirmadas"
            value={appointments.filter(a => a.status === 'confirmada').length}
            icon={CalendarCheck2}
          />
          <StatsCard
            title="Pendentes"
            value={appointments.filter(a => a.status === 'pendente').length}
            icon={CalendarClock}
          />
          <StatsCard
            title="Reagendadas"
            value={appointments.filter(a => a.status === 'reagendada').length}
            icon={CalendarSync}
          />
        </div>

        {/* Today's Schedule */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 m-0 p-0">
                <Calendar className="w-5 h-5 text-primary" />
                Hoje - {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </div>
            <CardDescription>
              {appointments.length} consultas agendadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredAppointments.map((appointment) => (
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
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Visão Semanal</CardTitle>
                <CardDescription>
                  Resumo da próxima semana
                </CardDescription>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Total de Consultas na Semana</span>
                <span className="text-2xl font-bold text-primary">{totalWeekAppointments}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                <div key={day} className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{day}</p>
                  <div className="bg-card rounded-lg p-3">
                    <p className="text-lg font-bold text-foreground">{index + 15}</p>
                    <p className="text-sm text-primary">{weekTotals[index]} consultas</p>
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