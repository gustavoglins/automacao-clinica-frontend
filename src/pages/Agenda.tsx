import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, Clock, Plus, Filter, Search, CalendarSync, CalendarCheck2, CalendarClock, Edit, MoreVertical, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { getAppointmentStatusBadge } from "@/lib/badgeUtils";
import { AddAppointmentDialog, FilterDialog } from "@/components/agenda";
import { toast } from "sonner";

const Agenda = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openAddAppointmentDialog, setOpenAddAppointmentDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterTimeRange, setFilterTimeRange] = useState("");
  const [filterService, setFilterService] = useState("");

  // Novos estados para controle de data e visualização
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [appointments, setAppointments] = useState([
    // Hoje
    {
      id: 1,
      time: "09:00",
      patient: "Maria Silva",
      service: "Limpeza",
      doctor: "Dr. João",
      status: "confirmada",
      duration: "1h",
      date: new Date().toISOString().split('T')[0],
      phone: "(11) 99999-9999"
    },
    {
      id: 2,
      time: "10:30",
      patient: "Carlos Santos",
      service: "Avaliação",
      doctor: "Dra. Ana",
      status: "pendente",
      duration: "30min",
      date: new Date().toISOString().split('T')[0],
      phone: "(11) 98888-8888"
    },
    {
      id: 3,
      time: "14:00",
      patient: "Ana Costa",
      service: "Tratamento Canal",
      doctor: "Dr. João",
      status: "confirmada",
      duration: "2h",
      date: new Date().toISOString().split('T')[0],
      phone: "(11) 97777-7777"
    },
    {
      id: 4,
      time: "15:30",
      patient: "Pedro Lima",
      service: "Implante",
      doctor: "Dr. Roberto",
      status: "reagendada",
      duration: "1h30min",
      date: new Date().toISOString().split('T')[0],
      phone: "(11) 96666-6666"
    },
    // Amanhã
    {
      id: 5,
      time: "08:00",
      patient: "Julia Ferreira",
      service: "Ortodontia",
      doctor: "Dra. Ana",
      status: "confirmada",
      duration: "45min",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: "(11) 95555-5555"
    },
    {
      id: 6,
      time: "11:00",
      patient: "Roberto Oliveira",
      service: "Extração",
      doctor: "Dr. Roberto",
      status: "pendente",
      duration: "1h",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: "(11) 94444-4444"
    },
    // Próxima semana
    {
      id: 7,
      time: "13:30",
      patient: "Fernanda Costa",
      service: "Clareamento",
      doctor: "Dra. Ana",
      status: "confirmada",
      duration: "2h",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: "(11) 93333-3333"
    },
    {
      id: 8,
      time: "16:00",
      patient: "Marcos Pereira",
      service: "Prótese",
      doctor: "Dr. João",
      status: "pendente",
      duration: "1h30min",
      date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: "(11) 92222-2222"
    }
  ]);

  // Lista de médicos únicos
  const doctors = Array.from(new Set(appointments.map(a => a.doctor)));

  // Funções utilitárias para navegação de data
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return formatDate(date1) === formatDate(date2);
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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];

    for (let day = 1; day <= lastDay.getDate(); day++) {
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
      dateFilteredAppointments = appointments.filter(appointment =>
        appointment.date === formatDate(selectedDate)
      );
    } else if (viewMode === 'week') {
      const weekDates = getWeekDates(selectedDate);
      const weekDatesStr = weekDates.map(d => formatDate(d));
      dateFilteredAppointments = appointments.filter(appointment =>
        weekDatesStr.includes(appointment.date)
      );
    } else if (viewMode === 'month') {
      const monthDates = getMonthDates(selectedDate);
      const monthDatesStr = monthDates.map(d => formatDate(d));
      dateFilteredAppointments = appointments.filter(appointment =>
        monthDatesStr.includes(appointment.date)
      );
    }

    // Aplicar filtros adicionais
    return dateFilteredAppointments.filter((appointment) => {
      const term = search.toLowerCase();
      const matchesSearch =
        appointment.patient.toLowerCase().includes(term) ||
        appointment.service.toLowerCase().includes(term) ||
        appointment.doctor.toLowerCase().includes(term);
      const matchesStatus = filterStatus ? appointment.status === filterStatus : true;
      const matchesDoctor = filterDoctor ? appointment.doctor === filterDoctor : true;
      return matchesSearch && matchesStatus && matchesDoctor;
    });
  };

  const filteredAppointments = getFilteredAppointmentsByView();

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
      date: newAppointment.date.toISOString().split('T')[0], // Converter Date para string
    };
    setAppointments(prev => [...prev, appointment]);
    setOpenAddAppointmentDialog(false);
    toast.success(`Consulta agendada para ${appointment.patient} em ${appointment.date} às ${appointment.time}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie todas as consultas e horários</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title={`Consultas ${viewMode === 'day' ? 'Hoje' : viewMode === 'week' ? 'na Semana' : 'no Mês'}`}
            value={filteredAppointments.length}
            icon={Calendar}
          />
          <StatsCard
            title="Confirmadas"
            value={filteredAppointments.filter(a => a.status === 'confirmada').length}
            icon={CalendarCheck2}
          />
          <StatsCard
            title="Pendentes"
            value={filteredAppointments.filter(a => a.status === 'pendente').length}
            icon={CalendarClock}
          />
          <StatsCard
            title="Reagendadas"
            value={filteredAppointments.filter(a => a.status === 'reagendada').length}
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
                        setFilterTimeRange("");
                        setFilterService("");
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

        {/* Controles de navegação e visualização */}
        <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border shadow-sm">
          {/* Seletor de modo de visualização */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="flex items-center gap-2 h-8"
            >
              <CalendarIcon className="w-4 h-4" />
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="flex items-center gap-2 h-8"
            >
              <CalendarDays className="w-4 h-4" />
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="flex items-center gap-2 h-8"
            >
              <CalendarRange className="w-4 h-4" />
              Mês
            </Button>
          </div>

          {/* Navegação de data */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center min-w-[280px]">
              <p className="font-semibold text-foreground text-sm">
                {viewMode === 'day' && selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {viewMode === 'week' && `Semana de ${getWeekDates(selectedDate)[0].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${getWeekDates(selectedDate)[6].toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                {viewMode === 'month' && selectedDate.toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              {isToday(selectedDate) && viewMode === 'day' && (
                <Badge variant="secondary" className="text-xs mt-1">Hoje</Badge>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="h-8 px-3"
            >
              Hoje
            </Button>
          </div>
        </div>
        {/* Dialog de Filtros */}
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

        {/* Schedule View */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 m-0 p-0">
                <Calendar className="w-5 h-5 text-primary" />
                {viewMode === 'day' && (
                  isToday(selectedDate)
                    ? `Hoje - ${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                    : selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                )}
                {viewMode === 'week' && `Consultas da Semana`}
                {viewMode === 'month' && `Consultas do Mês - ${selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}
              </CardTitle>
            </div>
            <CardDescription>
              {filteredAppointments.length} consulta{filteredAppointments.length !== 1 ? 's' : ''}
              {viewMode === 'day' && ' agendada' + (filteredAppointments.length !== 1 ? 's' : '')}
              {viewMode === 'week' && ' na semana'}
              {viewMode === 'month' && ' no mês'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Nenhuma consulta encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'day' && 'Não há consultas agendadas para este dia.'}
                  {viewMode === 'week' && 'Não há consultas agendadas para esta semana.'}
                  {viewMode === 'month' && 'Não há consultas agendadas para este mês.'}
                </p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
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
                      {viewMode !== 'day' && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </p>
                      )}
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
              ))
            )}
          </CardContent>
        </Card>

        {/* Visualização de Calendário (somente no modo mês) */}
        {viewMode === 'month' && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Calendário do Mês</CardTitle>
              <CardDescription>
                Visão geral das consultas por dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const monthDates = getMonthDates(selectedDate);
                  const firstDayOfWeek = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
                  const emptyDays = Array(firstDayOfWeek).fill(null);

                  return [...emptyDays, ...monthDates].map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="h-20"></div>;
                    }

                    const dayAppointments = appointments.filter(apt => apt.date === formatDate(date));
                    const isSelected = isSameDate(date, selectedDate);
                    const isCurrentDay = isToday(date);

                    return (
                      <div
                        key={formatDate(date)}
                        className={`
                          h-20 p-2 border rounded-lg cursor-pointer transition-colors
                          ${isSelected ? 'bg-primary/10 border-primary' : 'border-border hover:bg-muted/50'}
                          ${isCurrentDay ? 'ring-2 ring-primary/30' : ''}
                        `}
                        onClick={() => {
                          setSelectedDate(date);
                          setViewMode('day');
                        }}
                      >
                        <div className="text-sm font-semibold mb-1">
                          {date.getDate()}
                        </div>
                        {dayAppointments.length > 0 && (
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 2).map(apt => (
                              <div
                                key={apt.id}
                                className="text-xs p-1 bg-primary/20 rounded truncate"
                                title={`${apt.time} - ${apt.patient}`}
                              >
                                {apt.time} - {apt.patient}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayAppointments.length - 2} mais
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        )}

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