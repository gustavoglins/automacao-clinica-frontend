import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from '@/components/layout/AppLayout';
import { UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeService } from "@/services/employeeService";
import type { Employee } from "@/types/employee";
import { onlyNumbers } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EmployeeStats,
  Filters,
  EmployeeList,
  EmployeeProfileDialog,
  EditEmployeeDialog,
  DeleteEmployeeDialog,
  AddEmployeeDialog,
  FilterDialog
} from "@/components/funcionarios";
import { toast } from "sonner";

interface FilterState {
  search: string;
  role: string;
  specialty: string;
  showAll: boolean;
  // Filtros avançados
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  status?: string;
  location?: string;
  performance?: string;
}

function Funcionarios() {
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "all",
    specialty: "all",
    showAll: false,
    dateRange: { start: null, end: null },
    status: "",
    location: "",
    performance: ""
  });

  // Dialog states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modernProfileDialogOpen, setModernProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Fetch employees from service
  const fetchEmployees = async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      setEmployees(employees);
    } catch (error) {
      // Error handling is already done in the service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on current filters
  const filteredEmployees = employees.filter(employee => {
    const searchLower = filters.search.toLowerCase();
    const searchNumbers = onlyNumbers(filters.search);

    const matchesSearch = employee.fullName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.phone.includes(searchNumbers) || // Busca apenas pelos números
      employee.phone.includes(filters.search); // Busca pelo texto formatado também

    const matchesRole = !filters.role || filters.role === "all" || employee.role === filters.role;
    const matchesSpecialty = !filters.specialty || filters.specialty === "all" || employee.specialty === filters.specialty;

    // Filtros avançados
    const matchesStatus = !filters.status || employee.status === filters.status;

    // Filtro de data de admissão
    let matchesDateRange = true;
    if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
      const hireDate = new Date(employee.hiredAt);
      if (filters.dateRange.start && hireDate < filters.dateRange.start) {
        matchesDateRange = false;
      }
      if (filters.dateRange.end && hireDate > filters.dateRange.end) {
        matchesDateRange = false;
      }
    }

    // Para localização e performance, vamos assumir que não temos esses campos por enquanto
    // Podem ser implementados quando os campos existirem no tipo Employee
    const matchesLocation = !filters.location; // sempre true por enquanto
    const matchesPerformance = !filters.performance; // sempre true por enquanto

    return matchesSearch && matchesRole && matchesSpecialty && matchesStatus && matchesDateRange && matchesLocation && matchesPerformance;
  });

  // Event handlers
  const handleOpenProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModernProfileDialogOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
    setModernProfileDialogOpen(false);
  };

  const handleOpenDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
    setModernProfileDialogOpen(false);
  };

  const handleToggleShowAll = () => {
    setFilters(prev => ({ ...prev, showAll: !prev.showAll }));
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
    setEditDialogOpen(false);
  };

  const handleEmployeeDeleted = () => {
    fetchEmployees();
    setDeleteDialogOpen(false);
  };

  const handleEmployeeAdded = () => {
    fetchEmployees();
    setAddDialogOpen(false);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleOpenFilters = () => {
    setFilterDialogOpen(true);
  };

  const handleOpenAddEmployee = () => {
    setAddDialogOpen(true);
  };

  const handleApplyAdvancedFilters = (advancedFilters: {
    dateRange: { start: Date | null; end: Date | null };
    role: string;
    specialty: string;
    status: string;
    location: string;
    performance: string;
  }) => {
    setFilters(prev => ({
      ...prev,
      dateRange: advancedFilters.dateRange,
      status: advancedFilters.status,
      location: advancedFilters.location,
      performance: advancedFilters.performance,
      // Se os filtros avançados incluem role/specialty, atualizar também
      role: advancedFilters.role || prev.role,
      specialty: advancedFilters.specialty || prev.specialty
    }));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-muted-foreground">Gerencie os funcionários da clínica</p>
          </div>
        </div>

        {/* Stats */}
        <EmployeeStats employees={filteredEmployees} />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Filters */}
          <Filters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onOpenFilters={handleOpenFilters}
            onOpenAddEmployee={handleOpenAddEmployee}
            filteredEmployeesCount={filteredEmployees.length}
            totalEmployeesCount={employees.length}
          />

          {/* Employee List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Funcionários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os funcionários da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
                  <p className="text-gray-600 mb-4">
                    {filters.search || (filters.role && filters.role !== "all") || (filters.specialty && filters.specialty !== "all")
                      ? "Tente ajustar os filtros ou buscar por outros termos"
                      : "Comece adicionando o primeiro funcionário da clínica"}
                  </p>
                  {!(filters.search || (filters.role && filters.role !== "all") || (filters.specialty && filters.specialty !== "all")) && (
                    <Button
                      onClick={handleOpenAddEmployee}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <span className="mr-2 text-lg font-bold">+</span> Adicionar Primeiro Funcionário
                    </Button>
                  )}
                </div>
              ) : (
                <EmployeeList
                  employees={filteredEmployees}
                  showAll={filters.showAll}
                  onToggleShowAll={handleToggleShowAll}
                  onOpenProfile={handleOpenProfile}
                  onOpenEdit={handleOpenEdit}
                  onOpenDelete={handleOpenDelete}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <EditEmployeeDialog
          employee={selectedEmployee}
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onEmployeeUpdated={handleEmployeeUpdated}
        />

        <DeleteEmployeeDialog
          employee={selectedEmployee}
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onEmployeeDeleted={handleEmployeeDeleted}
        />

        <AddEmployeeDialog
          isOpen={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onEmployeeAdded={handleEmployeeAdded}
        />

        <FilterDialog
          isOpen={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          onApplyFilters={handleApplyAdvancedFilters}
        />

        <EmployeeProfileDialog
          employee={selectedEmployee}
          isOpen={modernProfileDialogOpen}
          onClose={() => setModernProfileDialogOpen(false)}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
        />
      </div>
    </AppLayout>
  );
}

export default Funcionarios;
