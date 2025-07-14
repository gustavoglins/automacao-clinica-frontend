import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, Clock, Plus, Filter, Search, CalendarSync, CalendarCheck2, CalendarClock, Edit, MoreVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { getAppointmentStatusBadge } from "@/lib/badgeUtils";
import { AddAppointmentDialog } from "@/components/agenda";
import { toast } from "sonner";

const Agenda = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openAddAppointmentDialog, setOpenAddAppointmentDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");

  const [appointments, setAppointments] = useState([
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
  ]);

  // Lista de médicos únicos
  const doctors = Array.from(new Set(appointments.map(a => a.doctor)));

  // Filtro
  const filteredAppointments = appointments.filter((appointment) => {
    const term = search.toLowerCase();
    const matchesSearch =
      appointment.patient.toLowerCase().includes(term) ||
      appointment.service.toLowerCase().includes(term) ||
      appointment.doctor.toLowerCase().includes(term);
    const matchesStatus = filterStatus ? appointment.status === filterStatus : true;
    const matchesDoctor = filterDoctor ? appointment.doctor === filterDoctor : true;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  // Simula o total de consultas na semana (soma dos valores exibidos nos cards dos dias)
  const weekTotals = [
    ...['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(() => Math.floor(Math.random() * 8) + 2)
  ];
  const totalWeekAppointments = weekTotals.reduce((acc, cur) => acc + cur, 0);

  // Função para adicionar nova consulta
  const handleAddAppointment = (newAppointment: {
    patient: string;
    phone: string;
    service: string;
    doctor: string;
    date: Date;
    time: string;
    duration: string;
    notes?: string;
    status: string;
  }) => {
    const appointment = {
      ...newAppointment,
      id: Math.max(...appointments.map(a => a.id)) + 1,
    };
    setAppointments(prev => [...prev, appointment]);
    setOpenAddAppointmentDialog(false);
    toast.success(`Consulta agendada para ${appointment.patient} em ${appointment.date.toLocaleDateString('pt-BR')} às ${appointment.time}`);
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
        </div>

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
                  onChange={e => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Button variant="classic" size="sm" className="gap-2" onClick={() => setOpenFilterDialog(true)}>
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button variant="primary" size="sm" className="gap-2" onClick={() => setOpenAddAppointmentDialog(true)}>
                <Plus className="w-4 h-4" />
                Nova Consulta
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Mostrando {filteredAppointments.length} de {appointments.length} consultas</span>
              {(search || filterStatus || filterDoctor) && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <span>Filtros ativos:</span>
                    {search && (
                      <Badge variant="secondary">
                        Busca: {search}
                      </Badge>
                    )}
                    {filterStatus && (
                      <Badge variant="secondary">
                        Status: {filterStatus}
                      </Badge>
                    )}
                    {filterDoctor && (
                      <Badge variant="secondary">
                        Médico: {filterDoctor}
                      </Badge>
                    )}
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
        {/* Dialog de Filtros */}
        <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
          <DialogContent className="max-w-sm w-full">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
              <DialogDescription>Filtre as consultas por status ou médico</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="pendente">Pendente</option>
                  <option value="reagendada">Reagendada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Médico</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={filterDoctor}
                  onChange={e => setFilterDoctor(e.target.value)}
                >
                  <option value="">Todos</option>
                  {doctors.map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => { setFilterStatus(""); setFilterDoctor(""); }}>Limpar</Button>
                <Button size="sm" variant="classic" onClick={() => setOpenFilterDialog(false)}>Aplicar Filtros</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
                      <Badge
                        variant={getAppointmentStatusBadge(appointment.status).variant}
                        className={getAppointmentStatusBadge(appointment.status).className}
                      >
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
                    <Button size="sm" variant="primary">
                      Confirmar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="classic" className="px-2"><span className="sr-only">Mais opções</span><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {/* ação de editar */ }}>
                          <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Dialogs */}
      <AddAppointmentDialog
        open={openAddAppointmentDialog}
        onOpenChange={setOpenAddAppointmentDialog}
        onAddAppointment={handleAddAppointment}
      />
    </AppLayout>
  );
};

export default Agenda;