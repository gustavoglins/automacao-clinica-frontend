import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { UserX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { employeeService } from "@/services/employeeService";
import type { Employee, CreateEmployeeData } from "@/types/employee";
import { onlyNumbers } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  EmployeeStats,
  Filters,
  EmployeeDataList,
  EmployeeProfileDialog,
  EditEmployeeDialog,
  DeleteEmployeeDialog,
  AddEmployeeDialog,
  FilterDialog,
} from "@/components/funcionarios";
import { toast } from "sonner";
import { useEmployees } from "@/context/EmployeeContext";

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
  // Estado para armazenar os dias de trabalho do funcionário selecionado
  const [employeeWorkDays, setEmployeeWorkDays] = useState<number[]>([]);
  const location = useLocation();
  // Usar contexto global de funcionários
  const { employees, setEmployees, loading, fetchEmployees } = useEmployees();
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "all",
    specialty: "all",
    showAll: false,
    dateRange: { start: null, end: null },
    status: "",
    location: "",
    performance: "",
  });

  // Dialog states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [modernProfileDialogOpen, setModernProfileDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Filter employees based on current filters
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = filters.search.toLowerCase();
    const searchNumbers = onlyNumbers(filters.search);

    const matchesSearch =
      employee.fullName.toLowerCase().includes(searchLower) ||
      (employee.email && employee.email.toLowerCase().includes(searchLower)) ||
      (employee.phone && employee.phone.includes(searchNumbers)) ||
      (employee.phone && employee.phone.includes(filters.search));

    const matchesRole =
      !filters.role || filters.role === "all" || employee.role === filters.role;
    const matchesSpecialty =
      !filters.specialty ||
      filters.specialty === "all" ||
      employee.specialty === filters.specialty;

    // Filtros avançados
    const matchesStatus = !filters.status || employee.status === filters.status;

    // Filtro de data de admissão
    let matchesDateRange = true;
    if (
      filters.dateRange &&
      (filters.dateRange.start || filters.dateRange.end)
    ) {
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

    return (
      matchesSearch &&
      matchesRole &&
      matchesSpecialty &&
      matchesStatus &&
      matchesDateRange &&
      matchesLocation &&
      matchesPerformance
    );
  });

  // Event handlers
  const handleOpenProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModernProfileDialogOpen(true);
  };

  const handleOpenEdit = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setModernProfileDialogOpen(false);
    // Buscar dias de trabalho do funcionário
    if (employee?.id) {
      const { data, error } = await supabase
        .from("work_hours")
        .select("weekday")
        .eq("employee_id", employee.id);
      if (!error && data) {
        setEmployeeWorkDays(data.map((w: { weekday: number }) => w.weekday));
      } else {
        setEmployeeWorkDays([]);
      }
    } else {
      setEmployeeWorkDays([]);
    }
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
    setModernProfileDialogOpen(false);
  };

  const handleToggleShowAll = () => {
    setFilters((prev) => ({ ...prev, showAll: !prev.showAll }));
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
    setEditDialogOpen(false);
  };

  const handleEmployeeDeleted = () => {
    fetchEmployees();
    setDeleteDialogOpen(false);
  };

  const handleEmployeeAdded = async (employeeData: CreateEmployeeData) => {
    try {
      await employeeService.createEmployeeWithSchedule(employeeData);
      fetchEmployees();
      setAddDialogOpen(false);
      // Toast de sucesso/erro já é disparado pelo service
    } catch (error) {
      // Toast de erro já é disparado pelo service
    }
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
    setFilters((prev) => ({
      ...prev,
      dateRange: advancedFilters.dateRange,
      status: advancedFilters.status,
      location: advancedFilters.location,
      performance: advancedFilters.performance,
      // Se os filtros avançados incluem role/specialty, atualizar também
      role: advancedFilters.role || prev.role,
      specialty: advancedFilters.specialty || prev.specialty,
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Funcionários
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gerencie os funcionários da clínica
            </p>
          </div>
        </div>

        {/* Stats */}
        <EmployeeStats employees={filteredEmployees} />

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
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
          <EmployeeDataList
            employees={filteredEmployees}
            onOpenProfile={handleOpenProfile}
            onOpenEdit={handleOpenEdit}
            onOpenDelete={handleOpenDelete}
            onAddNew={handleOpenAddEmployee}
            pagination="paged"
            pageSize={8}
            height="600px"
          />
        </div>

        {/* Dialogs */}
        <EmployeeProfileDialog
          employee={selectedEmployee}
          isOpen={modernProfileDialogOpen}
          onClose={() => setModernProfileDialogOpen(false)}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
        />
        <EditEmployeeDialog
          employee={selectedEmployee}
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onEmployeeUpdated={handleEmployeeUpdated}
          employeeWorkDays={employeeWorkDays}
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
      </div>
    </AppLayout>
  );
}

export default Funcionarios;
