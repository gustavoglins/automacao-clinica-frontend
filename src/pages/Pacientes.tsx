import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, Plus, Filter, Phone, Mail, Users, Calendar, Edit, ClipboardList, MoreVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [patientsPage, setPatientsPage] = useState(0);
  const [openAllPatientsDialog, setOpenAllPatientsDialog] = useState(false);
  const [dialogSearch, setDialogSearch] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || search;

  const PATIENTS_PER_PAGE = 5;

  const patients = [
    {
      id: 1,
      name: "Maria Silva",
      age: 34,
      phone: "(11) 99999-9999",
      email: "maria.silva@email.com",
      lastVisit: "2024-01-15",
      nextVisit: "2024-01-25",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 2,
      name: "Carlos Santos",
      age: 45,
      phone: "(11) 88888-8888",
      email: "carlos.santos@email.com",
      lastVisit: "2024-01-10",
      nextVisit: "2024-01-20",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 3,
      name: "Ana Costa",
      age: 28,
      phone: "(11) 77777-7777",
      email: "ana.costa@email.com",
      lastVisit: "2023-12-20",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 4,
      name: "Pedro Lima",
      age: 52,
      phone: "(11) 66666-6666",
      email: "pedro.lima@email.com",
      lastVisit: "2024-01-12",
      nextVisit: "2024-01-22",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 5,
      name: "Juliana Rocha",
      age: 39,
      phone: "(11) 95555-5555",
      email: "juliana.rocha@email.com",
      lastVisit: "2024-01-05",
      nextVisit: "2024-01-18",
      status: "ativo",
      plan: "Bradesco"
    },
    {
      id: 6,
      name: "Rafael Mendes",
      age: 31,
      phone: "(11) 94444-4444",
      email: "rafael.mendes@email.com",
      lastVisit: "2023-12-28",
      nextVisit: null,
      status: "inativo",
      plan: "Particular"
    },
    {
      id: 7,
      name: "Fernanda Alves",
      age: 27,
      phone: "(11) 93333-3333",
      email: "fernanda.alves@email.com",
      lastVisit: "2024-01-09",
      nextVisit: "2024-01-19",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 8,
      name: "Lucas Pereira",
      age: 40,
      phone: "(11) 92222-2222",
      email: "lucas.pereira@email.com",
      lastVisit: "2023-11-15",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 9,
      name: "Camila Fernandes",
      age: 36,
      phone: "(11) 91111-1111",
      email: "camila.fernandes@email.com",
      lastVisit: "2024-01-02",
      nextVisit: "2024-01-17",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 10,
      name: "Thiago Ribeiro",
      age: 49,
      phone: "(11) 90000-0000",
      email: "thiago.ribeiro@email.com",
      lastVisit: "2023-12-10",
      nextVisit: null,
      status: "inativo",
      plan: "Bradesco"
    },
    {
      id: 11,
      name: "Aline Souza",
      age: 33,
      phone: "(11) 98989-8989",
      email: "aline.souza@email.com",
      lastVisit: "2024-01-14",
      nextVisit: "2024-01-26",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 12,
      name: "Diego Martins",
      age: 29,
      phone: "(11) 97878-7878",
      email: "diego.martins@email.com",
      lastVisit: "2023-10-30",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 13,
      name: "Bruna Carvalho",
      age: 42,
      phone: "(11) 96767-6767",
      email: "bruna.carvalho@email.com",
      lastVisit: "2024-01-06",
      nextVisit: "2024-01-16",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 14,
      name: "Gabriel Silva",
      age: 37,
      phone: "(11) 95656-5656",
      email: "gabriel.silva@email.com",
      lastVisit: "2023-09-25",
      nextVisit: null,
      status: "inativo",
      plan: "Bradesco"
    },
    {
      id: 15,
      name: "Isabela Nunes",
      age: 26,
      phone: "(11) 94545-4545",
      email: "isabela.nunes@email.com",
      lastVisit: "2024-01-08",
      nextVisit: "2024-01-21",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 16,
      name: "Rodrigo Teixeira",
      age: 50,
      phone: "(11) 93434-3434",
      email: "rodrigo.teixeira@email.com",
      lastVisit: "2023-12-05",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 17,
      name: "Patrícia Lima",
      age: 38,
      phone: "(11) 92323-2323",
      email: "patricia.lima@email.com",
      lastVisit: "2024-01-11",
      nextVisit: "2024-01-27",
      status: "ativo",
      plan: "Particular"
    },
    {
      id: 18,
      name: "Eduardo Costa",
      age: 44,
      phone: "(11) 91212-1212",
      email: "eduardo.costa@email.com",
      lastVisit: "2023-07-10",
      nextVisit: null,
      status: "inativo",
      plan: "Bradesco"
    },
    {
      id: 19,
      name: "Letícia Barros",
      age: 30,
      phone: "(11) 90101-0101",
      email: "leticia.barros@email.com",
      lastVisit: "2024-01-13",
      nextVisit: "2024-01-23",
      status: "ativo",
      plan: "Unimed"
    },
    {
      id: 20,
      name: "Andréa Melo",
      age: 35,
      phone: "(11) 99090-9090",
      email: "andrea.melo@email.com",
      lastVisit: "2023-11-11",
      nextVisit: null,
      status: "inativo",
      plan: "Amil"
    },
    {
      id: 21,
      name: "Marcelo Araújo",
      age: 48,
      phone: "(11) 98888-1212",
      email: "marcelo.araujo@email.com",
      lastVisit: "2024-01-07",
      nextVisit: "2024-01-20",
      status: "ativo",
      plan: "Particular"
    }

  ];

  // Filtro
  const filteredPatients = patients.filter((patient) => {
    const term = query.toLowerCase();
    const matchesSearch =
      patient.name.toLowerCase().includes(term) ||
      patient.phone.toLowerCase().includes(term) ||
      patient.email.toLowerCase().includes(term);
    const matchesStatus = filterStatus ? patient.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const filteredDialogPatients = filteredPatients.filter(patient =>
    patient.name.toLowerCase().includes(dialogSearch.toLowerCase()) ||
    patient.phone.includes(dialogSearch) ||
    patient.phone.replace(/\D/g, "").includes(dialogSearch.replace(/\D/g, "")) ||
    patient.email.toLowerCase().includes(dialogSearch.toLowerCase())
  );

  useEffect(() => {
    setPatientsPage(0);
  }, [filteredPatients.length, query, filterStatus]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE) - 1);
    if (patientsPage > maxPage) {
      setPatientsPage(maxPage);
    }
  }, [patientsPage, filteredPatients.length]);

  const startIdx = patientsPage * PATIENTS_PER_PAGE;
  const endIdx = Math.min(startIdx + PATIENTS_PER_PAGE, filteredPatients.length);
  const paginatedPatients = filteredPatients.slice(startIdx, endIdx);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  function DialogSearchBar() {
    return (
      <div className="mb-4">
        <Input
          placeholder="Buscar paciente por nome, telefone ou email..."
          value={dialogSearch}
          onChange={e => setDialogSearch(e.target.value)}
          autoFocus
          className="w-full"
        />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground">Gerencie o cadastro e histórico dos pacientes</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, telefone ou email..."
                  className="pl-10"
                  value={query}
                  onChange={e => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Button variant="classic" size="sm" className="gap-2" onClick={() => setOpenFilterDialog(true)}>
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              {/* <Button variant="primary" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button> */}
            </div>
          </CardContent>
        </Card>
        {/* Dialog de Filtros */}
        <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
          <DialogContent className="max-w-sm w-full">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
              <DialogDescription>Filtre os pacientes por status</DialogDescription>
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
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => { setFilterStatus(""); }}>Limpar</Button>
                <Button size="sm" variant="classic" onClick={() => setOpenFilterDialog(false)}>Aplicar Filtros</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Pacientes"
            value={patients.length}
            icon={Users}
          />
          <StatsCard
            title="Pacientes Ativos"
            value={patients.filter(p => p.status === 'ativo').length}
            icon={Users}
          />
          <StatsCard
            title="Novos este Mês"
            value={45}
            icon={Plus}
          />
          <StatsCard
            title="Próximas Consultas"
            value={89}
            icon={Users}
          />
        </div>

        {/* Patients List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              {patients.length} pacientes encontrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[524px] space-y-4 flex flex-col">
              {paginatedPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{patient.name}</h3>
                        <Badge className={getStatusColor(patient.status)}>
                          {patient.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {patient.plan}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{patient.age} anos</span>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {patient.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Última: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
                        {patient.nextVisit && (
                          <span className="text-primary">Próxima: {new Date(patient.nextVisit).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="classic">
                      Ver Prontuário
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="classic" className="px-2"><span className="sr-only">Mais opções</span><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {/* ação de agendar */ }}>
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> Agendar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* ação de editar */ }}>
                          <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {Array.from({ length: PATIENTS_PER_PAGE - paginatedPatients.length }).map((_, idx) => (
                <div key={"placeholder-patient-" + idx} className="flex items-center justify-between p-4 rounded-lg flex-shrink-0 opacity-0 pointer-events-none">
                  <div className="flex items-center gap-4">
                    {/* Placeholder content */}
                  </div>
                </div>
              ))}
            </div>
            {filteredPatients.length > PATIENTS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Anterior"
                  onClick={() => setPatientsPage((p) => Math.max(0, p - 1))}
                  disabled={patientsPage === 0}
                >
                  <span className="sr-only">Anterior</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
                </Button>
                <span className="text-xs text-muted-foreground italic">
                  Mostrando {patientsPage * PATIENTS_PER_PAGE + 1}
                  -{Math.min((patientsPage + 1) * PATIENTS_PER_PAGE, filteredPatients.length)} de {filteredPatients.length} pacientes
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Próxima"
                  onClick={() => setPatientsPage((p) =>
                    (p + 1) < Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE) ? p + 1 : p
                  )}
                  disabled={(patientsPage + 1) * PATIENTS_PER_PAGE >= filteredPatients.length}
                >
                  <span className="sr-only">Próxima</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
                </Button>
              </div>
            )}
            <div className="mt-4">
              <Button size="sm" className="w-full mt-auto" variant="outline-primary" onClick={() => setOpenAllPatientsDialog(true)}>
                Ver Todos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Todos os Pacientes */}
      <Dialog open={openAllPatientsDialog} onOpenChange={setOpenAllPatientsDialog}>
        <DialogContent className="max-w-5xl w-full h-[95vh]">
          <DialogHeader>
            <DialogTitle>Todos os Pacientes</DialogTitle>
            <DialogDescription>Veja todos os pacientes cadastrados</DialogDescription>
          </DialogHeader>
          <DialogSearchBar />
          <div className="max-h-[80vh] overflow-y-auto space-y-3 mt-2">
            {filteredDialogPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{patient.name}</h3>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {patient.plan}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{patient.age} anos</span>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {patient.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Última: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
                      {patient.nextVisit && (
                        <span className="text-primary">Próxima: {new Date(patient.nextVisit).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="classic">
                    Ver Prontuário
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="classic" className="px-2"><span className="sr-only">Mais opções</span><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {/* ação de agendar */ }}>
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> Agendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {/* ação de editar */ }}>
                        <Edit className="w-4 h-4 mr-2 text-muted-foreground" /> Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Pacientes;