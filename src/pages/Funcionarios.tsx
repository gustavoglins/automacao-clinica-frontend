import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Search, Plus, Filter, Phone, Mail, Calendar, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Funcionarios = () => {
  const employees = [
    {
      id: 1,
      name: "Dra. Juliana Ferreira",
      role: "Dentista",
      specialty: "Ortodontia",
      phone: "(11) 91234-5678",
      email: "juliana.ferreira@clinica.com",
      status: "ativo",
      startDate: "2022-03-15"
    },
    {
      id: 2,
      name: "Dr. Rafael Oliveira",
      role: "Dentista",
      specialty: "Implantodontia",
      phone: "(11) 99876-5432",
      email: "rafael.oliveira@clinica.com",
      status: "ativo",
      startDate: "2023-01-10"
    },
    {
      id: 3,
      name: "Camila Souza",
      role: "Recepcionista",
      specialty: null,
      phone: "(11) 93456-7890",
      email: "camila.souza@clinica.com",
      status: "ativo",
      startDate: "2021-09-05"
    },
    {
      id: 4,
      name: "Fernanda Lima",
      role: "Auxiliar de Saúde Bucal",
      specialty: null,
      phone: "(11) 94567-1234",
      email: "fernanda.lima@clinica.com",
      status: "ativo",
      startDate: "2022-11-01"
    },
    {
      id: 5,
      name: "Thiago Martins",
      role: "Gerente Administrativo",
      specialty: null,
      phone: "(11) 95678-2345",
      email: "thiago.martins@clinica.com",
      status: "inativo",
      startDate: "2020-07-20"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-success/10 text-success border-success/20';
      case 'inativo':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Dentista':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Recepcionista':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'Auxiliar de Saúde Bucal':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Gerente Administrativo':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground">Gerencie o cadastro e informações da equipe</p>
          </div>
          <Button variant="primary" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Funcionário
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, função ou especialidade..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline-primary" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Funcionários</p>
                  <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Funcionários Ativos</p>
                  <p className="text-2xl font-bold text-success">{employees.filter(emp => emp.status === 'ativo').length}</p>
                </div>
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dentistas</p>
                  <p className="text-2xl font-bold text-accent">{employees.filter(emp => emp.role === 'Dentista').length}</p>
                </div>
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipe de Apoio</p>
                  <p className="text-2xl font-bold text-primary">{employees.filter(emp => emp.role !== 'Dentista').length}</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
            <CardDescription>
              {employees.length} funcionários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{employee.name}</h3>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>
                      <Badge className={getRoleColor(employee.role)}>
                        {employee.role}
                      </Badge>
                      {employee.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {employee.specialty}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {employee.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Admitido em: {new Date(employee.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline-primary">
                    Ver Perfil
                  </Button>
                  <Button size="sm" variant="outline-primary">
                    Horários
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

export default Funcionarios;
