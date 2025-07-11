import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from '@/components/layout/AppLayout';
import { UserX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeService } from "@/services/employeeService";
import type { Employee } from "@/types/employee";
import { onlyNumbers } from "@/lib/utils";
import {
  EmployeeStats,
  Filters,
  EmployeeList,
  ProfileDialog,
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
}

function Funcionarios() {
  const location = useLocation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "",
    specialty: "",
    showAll: false
  });

  // Dialog states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
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

    const matchesSearch = employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.phone.includes(searchNumbers) || // Busca apenas pelos números
      employee.phone.includes(filters.search); // Busca pelo texto formatado também

    const matchesRole = !filters.role || employee.role === filters.role;
    const matchesSpecialty = !filters.specialty || employee.specialty === filters.specialty;

    return matchesSearch && matchesRole && matchesSpecialty;
  });

  // Event handlers
  const handleOpenProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setProfileDialogOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
    setProfileDialogOpen(false);
  };

  const handleOpenDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
    setProfileDialogOpen(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os funcionários da clínica
            </p>
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
                  <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum funcionário encontrado</h3>
                  <p className="text-muted-foreground">
                    {filters.search || filters.role || filters.specialty
                      ? "Tente ajustar os filtros para ver mais resultados"
                      : "Comece adicionando seu primeiro funcionário"}
                  </p>
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
        <ProfileDialog
          employee={selectedEmployee}
          isOpen={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
        />

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
          onApplyFilters={() => { }} // Implementar se necessário
        />
      </div>
    </AppLayout>
  );
}

export default Funcionarios;
