import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Search, Plus, Filter, Phone, Mail, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Pacientes = () => {
  const [search, setSearch] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || search;

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
              <Button variant="outline-primary" size="sm" className="gap-2" onClick={() => setOpenFilterDialog(true)}>
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button variant="primary" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Button>
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
                <Button size="sm" variant="primary" onClick={() => setOpenFilterDialog(false)}>Aplicar Filtros</Button>
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
            {filteredPatients.map((patient) => (
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
                  <Button size="sm" variant="outline-primary">
                    Ver Prontuário
                  </Button>
                  <Button size="sm" variant="outline-success">
                    Agendar
                  </Button>
                  <Button size="sm" variant="outline-warning">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Pacientes;