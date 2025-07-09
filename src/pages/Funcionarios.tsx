import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from '@/components/layout/AppLayout';
import { Users, Search, Plus, Filter, Phone, Mail, Calendar, UserCheck, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

// Array de funcionários movido para fora do componente para evitar re-renderizações
const employees = [
  {
    id: 1,
    name: "Dra. Juliana Ferreira",
    role: "Dentista",
    specialty: "Ortodontia",
    phone: "(11) 91234-5678",
    email: "juliana.ferreira@clinica.com",
    startDate: "2022-03-15"
  },
  {
    id: 2,
    name: "Dr. Rafael Oliveira",
    role: "Dentista",
    specialty: "Implantodontia",
    phone: "(11) 99876-5432",
    email: "rafael.oliveira@clinica.com",
    startDate: "2023-01-10"
  },
  {
    id: 3,
    name: "Camila Souza",
    role: "Recepcionista",
    specialty: null,
    phone: "(11) 93456-7890",
    email: "camila.souza@clinica.com",
    startDate: "2021-09-05"
  },
  {
    id: 4,
    name: "Fernanda Lima",
    role: "Auxiliar de Saúde Bucal",
    specialty: null,
    phone: "(11) 94567-1234",
    email: "fernanda.lima@clinica.com",
    startDate: "2022-11-01"
  },
  {
    id: 5,
    name: "Thiago Martins",
    role: "Gerente Administrativo",
    specialty: null,
    phone: "(11) 95678-2345",
    email: "thiago.martins@clinica.com",
    startDate: "2020-07-20"
  },
  {
    id: 6,
    name: "Dra. Larissa Mendes",
    role: "Dentista",
    specialty: "Endodontia",
    phone: "(11) 91234-6789",
    email: "larissa.mendes@clinica.com",
    startDate: "2023-06-10"
  },
  {
    id: 7,
    name: "Dr. Bruno Rocha",
    role: "Dentista",
    specialty: "Periodontia",
    phone: "(11) 92345-7890",
    email: "bruno.rocha@clinica.com",
    startDate: "2022-08-22"
  },
  {
    id: 8,
    name: "Patrícia Almeida",
    role: "Recepcionista",
    specialty: null,
    phone: "(11) 93456-8901",
    email: "patricia.almeida@clinica.com",
    startDate: "2021-11-15"
  },
  {
    id: 9,
    name: "Marcos Vinícius",
    role: "Auxiliar de Saúde Bucal",
    specialty: null,
    phone: "(11) 94567-2345",
    email: "marcos.vinicius@clinica.com",
    startDate: "2023-02-01"
  },
  {
    id: 10,
    name: "Renata Gomes",
    role: "Gerente Administrativo",
    specialty: null,
    phone: "(11) 95678-3456",
    email: "renata.gomes@clinica.com",
    startDate: "2019-05-12"
  },
  {
    id: 11,
    name: "Dra. Carolina Pires",
    role: "Dentista",
    specialty: "Odontopediatria",
    phone: "(11) 96789-4567",
    email: "carolina.pires@clinica.com",
    startDate: "2023-09-30"
  },
  {
    id: 12,
    name: "Dr. Felipe Costa",
    role: "Dentista",
    specialty: "Prótese Dentária",
    phone: "(11) 97890-5678",
    email: "felipe.costa@clinica.com",
    startDate: "2021-07-19"
  },
  {
    id: 13,
    name: "Juliana Prado",
    role: "Recepcionista",
    specialty: null,
    phone: "(11) 98901-6789",
    email: "juliana.prado@clinica.com",
    startDate: "2020-12-10"
  },
  {
    id: 14,
    name: "Lucas Andrade",
    role: "Auxiliar de Saúde Bucal",
    specialty: null,
    phone: "(11) 99012-7890",
    email: "lucas.andrade@clinica.com",
    startDate: "2022-01-25"
  },
  {
    id: 15,
    name: "Ana Clara Silva",
    role: "Gerente Administrativo",
    specialty: null,
    phone: "(11) 90123-8901",
    email: "ana.silva@clinica.com",
    startDate: "2018-03-07"
  },
  {
    id: 16,
    name: "Dr. Eduardo Nunes",
    role: "Dentista",
    specialty: "Cirurgia Bucomaxilofacial",
    phone: "(11) 91234-1234",
    email: "eduardo.nunes@clinica.com",
    startDate: "2023-03-18"
  },
  {
    id: 17,
    name: "Dra. Bianca Ribeiro",
    role: "Dentista",
    specialty: "Estética",
    phone: "(11) 92345-2345",
    email: "bianca.ribeiro@clinica.com",
    startDate: "2022-10-02"
  },
  {
    id: 18,
    name: "Tatiane Moraes",
    role: "Recepcionista",
    specialty: null,
    phone: "(11) 93456-3456",
    email: "tatiane.moraes@clinica.com",
    startDate: "2021-06-09"
  },
  {
    id: 19,
    name: "Gabriel Faria",
    role: "Auxiliar de Saúde Bucal",
    specialty: null,
    phone: "(11) 94567-4567",
    email: "gabriel.faria@clinica.com",
    startDate: "2023-05-21"
  },
  {
    id: 20,
    name: "Simone Tavares",
    role: "Gerente Administrativo",
    specialty: null,
    phone: "(11) 95678-5678",
    email: "simone.tavares@clinica.com",
    startDate: "2017-04-15"
  },
  {
    id: 21,
    name: "Dr. André Meireles",
    role: "Dentista",
    specialty: "Radiologia",
    phone: "(11) 96789-6789",
    email: "andre.meireles@clinica.com",
    startDate: "2021-09-01"
  },
  {
    id: 22,
    name: "Dra. Vanessa Cruz",
    role: "Dentista",
    specialty: "Clínico Geral",
    phone: "(11) 97890-7890",
    email: "vanessa.cruz@clinica.com",
    startDate: "2022-02-14"
  },
  {
    id: 23,
    name: "Bruno Santana",
    role: "Recepcionista",
    specialty: null,
    phone: "(11) 98901-8901",
    email: "bruno.santana@clinica.com",
    startDate: "2020-08-11"
  },
  {
    id: 24,
    name: "Juliana Rocha",
    role: "Auxiliar de Saúde Bucal",
    specialty: null,
    phone: "(11) 99012-9012",
    email: "juliana.rocha@clinica.com",
    startDate: "2021-03-28"
  },
  {
    id: 25,
    name: "Leonardo Rezende",
    role: "Gerente Administrativo",
    specialty: null,
    phone: "(11) 90123-0123",
    email: "leonardo.rezende@clinica.com",
    startDate: "2016-01-30"
  },
  {
    id: 26,
    name: "Julia Lima",
    role: "Recepcionista",
    specialty: null,
    phone: "(11) 92144-0623",
    email: "julia.lima@clinica.com",
    startDate: "2016-01-31"
  }
];

const Funcionarios = () => {
  const [search, setSearch] = useState("");
  const [openNewEmployeeDialog, setOpenNewEmployeeDialog] = useState(false);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("q") || search;
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    specialty: "",
    phone: "",
    email: "",
    workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"], // Dias de trabalho padrão comercial
    startHour: "08:00",
    endHour: "18:00"
  });
  const [roleSearch, setRoleSearch] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleInputRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const { toast } = useToast();
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const specialtyInputRef = useRef(null);
  const specialtyDropdownRef = useRef(null);
  const [touched, setTouched] = useState({
    name: false,
    role: false,
    specialty: false,
    phone: false,
    email: false,
    workDays: false,
    startHour: false,
    endHour: false
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  // Listas únicas
  const roles = Array.from(new Set(employees.map(e => e.role)));
  const specialties = Array.from(new Set(employees.map(e => e.specialty).filter(Boolean)));

  // Lista de funções típicas de uma clínica odontológica
  const clinicRoles = [
    "Dentista",
    "Ortodontista",
    "Endodontista",
    "Periodontista",
    "Implantodontista",
    "Protesista",
    "Odontopediatra",
    "Cirurgião Bucomaxilofacial",
    "Recepcionista",
    "Auxiliar de Saúde Bucal",
    "Técnico em Saúde Bucal",
    "Gerente Administrativo",
    "Higienista",
    "Financeiro",
    "Atendente",
    "Radiologista",
    "Secretária",
    "Zelador(a)",
    "Estagiário(a)"
  ];

  // Lista de especialidades odontológicas
  const clinicSpecialties = [
    "Ortodontia",
    "Endodontia",
    "Periodontia",
    "Implantodontia",
    "Prótese Dentária",
    "Odontopediatria",
    "Cirurgia Bucomaxilofacial",
    "Radiologia Odontológica",
    "Odontologia Estética",
    "Odontogeriatria",
    "Odontologia do Trabalho",
    "Odontologia Legal",
    "Disfunção Temporomandibular (DTM)",
    "Patologia Oral",
    "Dentística",
    "Saúde Coletiva",
    "Harmonização Orofacial",
    "Odontologia Hospitalar",
    "Odontologia para Pacientes com Necessidades Especiais",
    "Odontologia Preventiva",
    "Odontologia Restauradora"
  ];

  // Função para normalizar texto removendo acentos e caracteres especiais
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .trim();
  };

  // Filtro principal com normalização e busca inteligente
  const filteredEmployees = employees.filter((employee) => {
    const normalizedTerm = normalizeText(query);
    if (!normalizedTerm && !filterRole && !filterSpecialty) return true;
    const searchableFields = [
      normalizeText(employee.name),
      normalizeText(employee.role),
      normalizeText(employee.specialty || ""),
      normalizeText(employee.email),
      employee.phone.replace(/\D/g, ""),
    ];
    const matchesSearch = normalizedTerm ? searchableFields.some(field => field.includes(normalizedTerm)) : true;
    const matchesRole = filterRole ? employee.role === filterRole : true;
    const matchesSpecialty = filterSpecialty ? (employee.specialty === filterSpecialty) : true;
    return matchesSearch && matchesRole && matchesSpecialty;
  });

  async function handleNewEmployeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // 1. Inserir funcionário (apenas os campos da tabela employees)
      const { data, error } = await supabase
        .from('employees')
        .insert([
          {
            name: newEmployee.name,
            email: newEmployee.email,
            phone: newEmployee.phone,
            role: newEmployee.role
          }
        ])
        .select('id')
        .single();
      if (error) {
        console.error("DADOS - Erro ao inserir funcionário:", error); // Log do erro ============
        throw error;
      }

      // 2. Mapear workDays para números (0=Dom, ..., 6=Sáb)
      const dayMap = { 'Dom': 0, 'Seg': 1, 'Ter': 2, 'Qua': 3, 'Qui': 4, 'Sex': 5, 'Sáb': 6 };
      const schedules = newEmployee.workDays.map(day => ({
        employee_id: data.id,
        day_of_week: dayMap[day],
        start_time: newEmployee.startHour,
        end_time: newEmployee.endHour
      }));

      // 3. Inserir horários
      if (schedules.length > 0) {
        const { error: schedError } = await supabase
          .from('employee_work_schedules')
          .insert(schedules);
        if (schedError) {
          console.error("schedError - Erro ao inserir funcionário:", schedError); // Log do erro ============
          throw schedError;
        }
      }

      toast({
        title: undefined,
        description: (
          <span className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" /> Funcionário cadastrado com sucesso!
          </span>
        ),
        duration: 3000
      });
      setOpenNewEmployeeDialog(false);
      setNewEmployee({ name: "", role: "", specialty: "", phone: "", email: "", workDays: ["Seg", "Ter", "Qua", "Qui", "Sex"], startHour: "08:00", endHour: "18:00" });
    } catch (err) {
      toast({ title: "Erro ao cadastrar funcionário!" });
    }
  }

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target) &&
        roleInputRef.current &&
        !roleInputRef.current.contains(event.target)
      ) {
        setShowRoleDropdown(false);
      }
    }
    if (showRoleDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showRoleDropdown]);

  // Fecha o dropdown de especialidade ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        specialtyDropdownRef.current &&
        !specialtyDropdownRef.current.contains(event.target) &&
        specialtyInputRef.current &&
        !specialtyInputRef.current.contains(event.target)
      ) {
        setShowSpecialtyDropdown(false);
      }
    }
    if (showSpecialtyDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSpecialtyDropdown]);

  // Função para formatar telefone brasileiro
  function formatPhone(phone: string) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validate = () => {
    return {
      name: !newEmployee.name,
      role: !newEmployee.role,
      specialty: !newEmployee.specialty,
      phone: !newEmployee.phone,
      phoneInvalid: newEmployee.phone && !isValidPhone(newEmployee.phone),
      email: !newEmployee.email,
      emailInvalid: newEmployee.email && !isValidEmail(newEmployee.email),
      workDays: !newEmployee.workDays.length,
      startHour: !newEmployee.startHour,
      endHour: !newEmployee.endHour
    };
  };
  const errors = validate();

  // Estados para paginação dos funcionários
  const [employeesPage, setEmployeesPage] = useState(0);
  const EMPLOYEES_PER_PAGE = 5;
  const [openAllEmployeesDialog, setOpenAllEmployeesDialog] = useState(false);
  const [dialogSearch, setDialogSearch] = useState("");

  // Sempre clamp o índice da página ao máximo permitido
  useEffect(() => {
    setEmployeesPage(0);
  }, [filteredEmployees.length, query, filterRole, filterSpecialty]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE) - 1);
    if (employeesPage > maxPage) {
      setEmployeesPage(maxPage);
    }
  }, [employeesPage, filteredEmployees.length]);

  // Corrige bug: sempre mostra no máximo 5 cards, nunca mais
  const startIdx = employeesPage * EMPLOYEES_PER_PAGE;
  const endIdx = Math.min(startIdx + EMPLOYEES_PER_PAGE, filteredEmployees.length);
  const paginatedEmployees = filteredEmployees.slice(startIdx, endIdx);

  // Função de busca inteligente para o dialog
  const searchInDialog = (employee: typeof employees[0], searchTerm: string) => {
    if (!searchTerm.trim()) return true;

    const normalizedSearch = normalizeText(searchTerm);

    // Campos pesquisáveis normalizados
    const searchableFields = [
      normalizeText(employee.name),
      normalizeText(employee.role),
      normalizeText(employee.specialty || ""),
      normalizeText(employee.email),
      employee.phone.replace(/\D/g, ""), // Apenas números
    ];

    // Verifica se o termo está presente em qualquer campo
    return searchableFields.some(field => field.includes(normalizedSearch));
  };

  const filteredDialogEmployees = employees.filter(emp =>
    searchInDialog(emp, dialogSearch)
  );

  // Componente da barra de pesquisa do Dialog
  function DialogSearchBar() {
    return (
      <div className="mb-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, função, especialidade, email ou telefone..."
            value={dialogSearch}
            onChange={e => setDialogSearch(e.target.value)}
            autoFocus
            className="w-full pl-10"
            autoComplete="off"
          />
        </div>
        {dialogSearch.trim() && (
          <div className="mt-2 text-xs text-muted-foreground">
            {dialogSearch.length < 2 ? (
              'Digite pelo menos 2 caracteres para buscar'
            ) : (
              `${filteredDialogEmployees.length} funcionário${filteredDialogEmployees.length !== 1 ? 's' : ''} encontrado${filteredDialogEmployees.length !== 1 ? 's' : ''}`
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground">Gerencie o cadastro e informações da equipe</p>
          </div>
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
                  value={query}
                  onChange={e => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <Button variant="classic" size="sm" className="gap-2" onClick={() => setOpenFilterDialog(true)}>
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button variant="primary" size="sm" className="gap-2" onClick={() => setOpenNewEmployeeDialog(true)}>
                <Plus className="w-4 h-4" />
                Novo Funcionário
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Dialog: Novo Funcionário */}
        <Dialog open={openNewEmployeeDialog} onOpenChange={setOpenNewEmployeeDialog}>
          <DialogContent className="max-w-xl w-full">
            <DialogHeader>
              <DialogTitle>Novo Funcionário</DialogTitle>
              <DialogDescription>Preencha os dados para cadastrar um novo funcionário</DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-2" onSubmit={e => {
              setSubmitAttempted(true);
              setTouched({
                name: true,
                role: true,
                specialty: true,
                phone: true,
                email: true,
                workDays: true,
                startHour: true,
                endHour: true
              });
              if (Object.values(validate()).some(Boolean)) {
                e.preventDefault();
                return;
              }
              handleNewEmployeeSubmit(e);
            }}>
              <div>
                <label className="block text-sm font-medium mb-1">Nome <span className="text-red-600">*</span></label>
                <Input
                  value={newEmployee.name}
                  onChange={e => setNewEmployee(emp => ({ ...emp, name: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  required
                  aria-invalid={errors.name && (touched.name || submitAttempted)}
                />
                {errors.name && (touched.name || submitAttempted) && (
                  <span className="text-xs text-red-600">Preencha o nome</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Função <span className="text-red-600">*</span></label>
                <div className="relative">
                  <Input
                    ref={roleInputRef}
                    type="text"
                    placeholder="Buscar e selecionar função..."
                    className="cursor-pointer"
                    value={roleSearch || newEmployee.role}
                    onFocus={() => setShowRoleDropdown(true)}
                    onChange={e => {
                      setRoleSearch(e.target.value);
                      setShowRoleDropdown(true);
                      setNewEmployee(emp => ({ ...emp, role: "" }));
                    }}
                    onBlur={() => setTouched(t => ({ ...t, role: true }))}
                    autoComplete="off"
                    readOnly={false}
                    required
                    aria-invalid={errors.role && (touched.role || submitAttempted)}
                  />
                  {errors.role && (touched.role || submitAttempted) && (
                    <span className="text-xs text-red-600 absolute left-0 mt-1">Selecione a função</span>
                  )}
                  {showRoleDropdown && (
                    <ul
                      ref={roleDropdownRef}
                      className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-auto mt-1"
                    >
                      {clinicRoles.filter(role => role.toLowerCase().includes(roleSearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-muted-foreground">Nenhuma função encontrada</li>
                      )}
                      {clinicRoles
                        .filter(role => role.toLowerCase().includes(roleSearch.toLowerCase()))
                        .map(role => (
                          <li
                            key={role}
                            className={`px-3 py-2 cursor-pointer hover:bg-primary/10 ${newEmployee.role === role ? "bg-primary/20" : ""}`}
                            onClick={() => {
                              setNewEmployee(emp => ({ ...emp, role }));
                              setRoleSearch("");
                              setShowRoleDropdown(false);
                            }}
                          >
                            {role}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Especialidade <span className="text-red-600">*</span></label>
                <div className="relative">
                  <Input
                    ref={specialtyInputRef}
                    type="text"
                    placeholder="Buscar e selecionar especialidade..."
                    className="cursor-pointer"
                    value={specialtySearch || newEmployee.specialty}
                    onFocus={() => setShowSpecialtyDropdown(true)}
                    onChange={e => {
                      setSpecialtySearch(e.target.value);
                      setShowSpecialtyDropdown(true);
                      setNewEmployee(emp => ({ ...emp, specialty: "" }));
                    }}
                    onBlur={() => setTouched(t => ({ ...t, specialty: true }))}
                    autoComplete="off"
                    readOnly={false}
                    required
                    aria-invalid={errors.specialty && (touched.specialty || submitAttempted)}
                  />
                  {errors.specialty && (touched.specialty || submitAttempted) && (
                    <span className="text-xs text-red-600 absolute left-0 mt-1">Selecione a especialidade</span>
                  )}
                  {showSpecialtyDropdown && (
                    <ul
                      ref={specialtyDropdownRef}
                      className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-auto mt-1"
                    >
                      {clinicSpecialties.filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase())).length === 0 && (
                        <li className="px-3 py-2 text-muted-foreground">Nenhuma especialidade encontrada</li>
                      )}
                      {clinicSpecialties
                        .filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase()))
                        .map(s => (
                          <li
                            key={s}
                            className={`px-3 py-2 cursor-pointer hover:bg-primary/10 ${newEmployee.specialty === s ? "bg-primary/20" : ""}`}
                            onClick={() => {
                              setNewEmployee(emp => ({ ...emp, specialty: s }));
                              setSpecialtySearch("");
                              setShowSpecialtyDropdown(false);
                            }}
                          >
                            {s}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone <span className="text-red-600">*</span></label>
                <Input
                  value={formatPhone(newEmployee.phone)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setNewEmployee(emp => ({ ...emp, phone: raw }));
                  }}
                  onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                  required
                  aria-invalid={(errors.phone || errors.phoneInvalid) && (touched.phone || submitAttempted)}
                  inputMode="tel"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (touched.phone || submitAttempted) && (
                  <span className="text-xs text-red-600">Preencha o telefone</span>
                )}
                {!errors.phone && errors.phoneInvalid && (touched.phone || submitAttempted) && (
                  <span className="text-xs text-red-600">Telefone inválido</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-red-600">*</span></label>
                <Input
                  value={newEmployee.email}
                  onChange={e => setNewEmployee(emp => ({ ...emp, email: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  required
                  aria-invalid={(errors.email || errors.emailInvalid) && (touched.email || submitAttempted)}
                  inputMode="email"
                  type="email"
                  placeholder="exemplo@dominio.com"
                />
                {errors.email && (touched.email || submitAttempted) && (
                  <span className="text-xs text-red-600">Preencha o email</span>
                )}
                {!errors.email && errors.emailInvalid && (touched.email || submitAttempted) && (
                  <span className="text-xs text-red-600">Email inválido</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dias de Trabalho <span className="text-red-600">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => {
                    const selected = newEmployee.workDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        className={`px-3 py-1 rounded-full border text-sm transition-colors
                          ${selected ? 'bg-primary text-white border-primary shadow' : 'bg-muted text-foreground border-muted-foreground hover:bg-primary/10'}`}
                        onClick={() => {
                          setNewEmployee(emp => {
                            const workDays = emp.workDays.includes(day)
                              ? emp.workDays.filter(d => d !== day)
                              : [...emp.workDays, day];
                            return { ...emp, workDays };
                          });
                          setTouched(t => ({ ...t, workDays: true }));
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {errors.workDays && (touched.workDays || submitAttempted) && (
                  <span className="text-xs text-red-600">Selecione pelo menos um dia</span>
                )}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Hora de Entrada <span className="text-red-600">*</span></label>
                  <Input
                    type="time"
                    value={newEmployee.startHour}
                    onChange={e => setNewEmployee(emp => ({ ...emp, startHour: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, startHour: true }))}
                    required
                    aria-invalid={errors.startHour && (touched.startHour || submitAttempted)}
                  />
                  {errors.startHour && (touched.startHour || submitAttempted) && (
                    <span className="text-xs text-red-600">Informe a hora de entrada</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Hora de Saída <span className="text-red-600">*</span></label>
                  <Input
                    type="time"
                    value={newEmployee.endHour}
                    onChange={e => setNewEmployee(emp => ({ ...emp, endHour: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, endHour: true }))}
                    required
                    aria-invalid={errors.endHour && (touched.endHour || submitAttempted)}
                  />
                  {errors.endHour && (touched.endHour || submitAttempted) && (
                    <span className="text-xs text-red-600">Informe a hora de saída</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline-primary" type="button" onClick={() => setOpenNewEmployeeDialog(false)}>Cancelar</Button>
                <Button size="sm" variant="primary" type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Dialog de Filtros */}
        <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
          <DialogContent className="max-w-sm w-full">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
              <DialogDescription>Filtre os funcionários por função ou especialidade</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                >
                  <option value="">Todas</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Especialidade</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={filterSpecialty}
                  onChange={e => setFilterSpecialty(e.target.value)}
                >
                  <option value="">Todas</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => { setFilterRole(""); setFilterSpecialty(""); }}>Limpar</Button>
                <Button size="sm" variant="classic" onClick={() => setOpenFilterDialog(false)}>Aplicar Filtros</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Funcionários"
            value={employees.length}
            icon={Users}
          />
          <StatsCard
            title="Funcionários Ativos"
            value={employees.length} // Agora mostra o total, pois não há mais status
            icon={UserCheck}
          />
          <StatsCard
            title="Dentistas"
            value={employees.filter(emp => emp.role === 'Dentista').length}
            icon={Users}
          />
          <StatsCard
            title="Equipe de Apoio"
            value={employees.filter(emp => emp.role !== 'Dentista').length}
            icon={Users}
          />
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
            {/* Container com altura fixa calculada para exatamente 5 funcionários */}
            <div className="h-[524px] space-y-4 flex flex-col">
              {/* Renderiza funcionários reais */}
              {paginatedEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{employee.name}</h3>
                        <Badge variant="outline" className='text-xs'>
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
                    <Button size="sm" variant="classic">
                      Ver Perfil
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="classic" className="px-2"><span className="sr-only">Mais opções</span><svg width="18" height="18" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" fill="currentColor" /><circle cx="10" cy="10" r="1.5" fill="currentColor" /><circle cx="10" cy="16" r="1.5" fill="currentColor" /></svg></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {/* ação de horários */ }}>
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> Horários
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* ação de editar */ }}>
                          <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487l1.65-1.65a2.121 2.121 0 113 3l-1.65 1.65m-2-2l-9.193 9.193a2 2 0 00-.497.878l-.684 2.736a.5.5 0 00.606.606l2.736-.684a2 2 0 00.878-.497l9.193-9.193m-2-2z" /></svg> Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Placeholders invisíveis para completar sempre 5 linhas */}
              {Array.from({ length: EMPLOYEES_PER_PAGE - paginatedEmployees.length }).map((_, idx) => (
                <div key={"placeholder-employee-" + idx} className="flex items-center justify-between p-4 rounded-lg flex-shrink-0 opacity-0 pointer-events-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">AB</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Nome do Funcionário</h3>
                        <Badge variant="outline" className='text-xs'>Função</Badge>
                        <Badge variant="outline" className="text-xs">Especialidade</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          (11) 99999-9999
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          email@exemplo.com
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Admitido em: 01/01/2020</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="classic">Ver Perfil</Button>
                    <Button size="sm" variant="classic" className="px-2">⋮</Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Paginação */}
            {filteredEmployees.length > EMPLOYEES_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Anterior"
                  onClick={() => setEmployeesPage((p) => Math.max(0, p - 1))}
                  disabled={employeesPage === 0}
                >
                  <span className="sr-only">Anterior</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg>
                </Button>
                <span className="text-xs text-muted-foreground italic">
                  Mostrando {employeesPage * EMPLOYEES_PER_PAGE + 1}
                  -{Math.min((employeesPage + 1) * EMPLOYEES_PER_PAGE, filteredEmployees.length)} de {filteredEmployees.length} funcionários
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  title="Próxima"
                  onClick={() => setEmployeesPage((p) =>
                    (p + 1) < Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE) ? p + 1 : p
                  )}
                  disabled={(employeesPage + 1) * EMPLOYEES_PER_PAGE >= filteredEmployees.length}
                >
                  <span className="sr-only">Próxima</span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" /></svg>
                </Button>
              </div>
            )}
            <div className="mt-4">
              <Button size="sm" className="w-full mt-auto" variant="outline-primary" onClick={() => setOpenAllEmployeesDialog(true)}>
                Ver Todos
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Dialog: Todos os Funcionários */}
        <Dialog open={openAllEmployeesDialog} onOpenChange={setOpenAllEmployeesDialog}>
          <DialogContent className="max-w-5xl w-full max-h-[95vh] m-0 top-4 translate-y-0 p-0 overflow-hidden">
            <div className="flex flex-col h-full max-h-[95vh]">
              {/* Header fixo */}
              <div className="flex-shrink-0 p-6 pb-4 border-b bg-background">
                <DialogHeader>
                  <DialogTitle>Todos os Funcionários</DialogTitle>
                  <DialogDescription>Veja todos os funcionários cadastrados</DialogDescription>
                </DialogHeader>
              </div>

              {/* Barra de pesquisa fixa */}
              <div className="flex-shrink-0 p-6 py-4 border-b bg-muted/10">
                <DialogSearchBar />
              </div>

              {/* Conteúdo rolável centralizado */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-4">
                  <div className="max-w-4xl mx-auto space-y-3">
                    {filteredDialogEmployees.length === 0 && dialogSearch.trim().length >= 2 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="mb-2">
                          <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
                        </div>
                        <p>Nenhum funcionário encontrado para "{dialogSearch}"</p>
                        <p className="text-sm mt-1">Tente buscar por nome, função, especialidade, email ou telefone</p>
                      </div>
                    ) : (
                      <>
                        {filteredDialogEmployees.map((employee) => (
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
                                  <Badge variant="outline" className='text-xs'>
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
                              <Button size="sm" variant="classic">
                                Ver Perfil
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="classic" className="px-2"><span className="sr-only">Mais opções</span><svg width="18" height="18" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="4" r="1.5" fill="currentColor" /><circle cx="10" cy="10" r="1.5" fill="currentColor" /><circle cx="10" cy="16" r="1.5" fill="currentColor" /></svg></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {/* ação de horários */ }}>
                                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" /> Horários
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {/* ação de editar */ }}>
                                    <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487l1.65-1.65a2.121 2.121 0 113 3l-1.65 1.65m-2-2l-9.193 9.193a2 2 0 00-.497.878l-.684 2.736a.5.5 0 00.606.606l2.736-.684a2 2 0 00.878-.497l9.193-9.193m-2-2z" /></svg> Editar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                        {/* Padding no final para garantir scroll */}
                        <div className="h-8"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Funcionarios;
