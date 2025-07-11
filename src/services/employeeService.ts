import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { isValidPhone, onlyNumbers } from '@/lib/utils';
import type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  SupabaseEmployee,
  SupabaseEmployeeUpdate,
  SupabaseEmployeeInsert,
  SupabaseEmployeeWorkSchedule,
  SupabaseEmployeeWorkScheduleInsert,
  EmployeeFilters,
  EmployeeStats,
  ValidationResult
} from '@/types/employee';
import { WEEKDAY_MAP, REVERSE_WEEKDAY_MAP } from '@/types/employee';

// Re-export types for backward compatibility
export type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
  EmployeeStats,
  ValidationResult
};

/**
 * Utility functions for data transformation
 */
class EmployeeTransformer {
  /**
   * Transform Supabase employee data to app Employee interface
   */
  static fromSupabase(supabaseEmployee: SupabaseEmployee, workSchedules?: SupabaseEmployeeWorkSchedule[]): Employee {
    const employee: Employee = {
      id: supabaseEmployee.id,
      name: supabaseEmployee.name,
      email: supabaseEmployee.email,
      phone: supabaseEmployee.phone,
      cpf: supabaseEmployee.cpf,
      role: supabaseEmployee.role,
      specialty: supabaseEmployee.specialty,
      registrationNumber: supabaseEmployee.registration_number,
      hireDate: supabaseEmployee.hire_date,
      salary: supabaseEmployee.salary,
      status: supabaseEmployee.status,
      visibleOnSchedule: supabaseEmployee.visible_on_schedule,
      acceptsOnlineBooking: supabaseEmployee.accepts_online_booking,
      showContact: supabaseEmployee.show_contact,
      avatarUrl: supabaseEmployee.avatar_url,
      notes: supabaseEmployee.notes,
      createdAt: supabaseEmployee.created_at,
      updatedAt: supabaseEmployee.updated_at
    };

    // Add work schedule if provided
    if (workSchedules && workSchedules.length > 0) {
      employee.workDays = workSchedules.map(schedule => REVERSE_WEEKDAY_MAP[schedule.weekday]);
      // Assume same hours for all days (could be enhanced to support different hours per day)
      employee.startHour = workSchedules[0].start_time;
      employee.endHour = workSchedules[0].end_time;
    }

    return employee;
  }

  /**
   * Transform Supabase employee data to app Employee interface (for array mapping)
   */
  static fromSupabaseSimple(supabaseEmployee: SupabaseEmployee): Employee {
    return EmployeeTransformer.fromSupabase(supabaseEmployee);
  }

  /**
   * Transform CreateEmployeeData to Supabase insert format
   */
  static toSupabaseInsert(employeeData: CreateEmployeeData): SupabaseEmployeeInsert {
    return {
      name: employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      cpf: employeeData.cpf || null,
      role: employeeData.role,
      specialty: employeeData.specialty || null,
      registration_number: employeeData.registrationNumber || null,
      hire_date: employeeData.hireDate,
      salary: employeeData.salary || null,
      status: employeeData.status || 'ativo',
      visible_on_schedule: employeeData.visibleOnSchedule ?? true,
      accepts_online_booking: employeeData.acceptsOnlineBooking ?? true,
      show_contact: employeeData.showContact ?? false,
      avatar_url: employeeData.avatarUrl || null,
      notes: employeeData.notes || null
    };
  }

  /**
   * Transform work schedule data to Supabase insert format
   */
  static toSupabaseWorkScheduleInsert(
    employeeId: number,
    workDays: string[],
    startHour: string,
    endHour: string
  ): SupabaseEmployeeWorkScheduleInsert[] {
    return workDays.map(day => ({
      employee_id: employeeId,
      weekday: WEEKDAY_MAP[day],
      start_time: startHour,
      end_time: endHour
    }));
  }

  /**
   * Transform UpdateEmployeeData to Supabase update format
   */
  static toSupabaseUpdate(employeeData: UpdateEmployeeData): SupabaseEmployeeUpdate {
    const updateData: SupabaseEmployeeUpdate = {};

    // Only include fields that are provided
    if (employeeData.name !== undefined) updateData.name = employeeData.name;
    if (employeeData.email !== undefined) updateData.email = employeeData.email;
    if (employeeData.phone !== undefined) updateData.phone = employeeData.phone;
    if (employeeData.cpf !== undefined) updateData.cpf = employeeData.cpf || null;
    if (employeeData.role !== undefined) updateData.role = employeeData.role;
    if (employeeData.specialty !== undefined) updateData.specialty = employeeData.specialty || null;
    if (employeeData.registrationNumber !== undefined) updateData.registration_number = employeeData.registrationNumber || null;
    if (employeeData.hireDate !== undefined) updateData.hire_date = employeeData.hireDate;
    if (employeeData.salary !== undefined) updateData.salary = employeeData.salary || null;
    if (employeeData.status !== undefined) updateData.status = employeeData.status;
    if (employeeData.visibleOnSchedule !== undefined) updateData.visible_on_schedule = employeeData.visibleOnSchedule;
    if (employeeData.acceptsOnlineBooking !== undefined) updateData.accepts_online_booking = employeeData.acceptsOnlineBooking;
    if (employeeData.showContact !== undefined) updateData.show_contact = employeeData.showContact;
    if (employeeData.avatarUrl !== undefined) updateData.avatar_url = employeeData.avatarUrl || null;
    if (employeeData.notes !== undefined) updateData.notes = employeeData.notes || null;

    return updateData;
  }
}

class EmployeeService {
  /**
   * Fetch all employees from database
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map(EmployeeTransformer.fromSupabaseSimple);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Erro ao carregar funcionários');
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: number): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
      toast.error('Erro ao carregar funcionário');
      throw error;
    }
  }

  /**
   * Create a new employee
   */
  async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    try {
      const insertData = EmployeeTransformer.toSupabaseInsert(employeeData);

      const { data, error } = await supabase
        .from('employees')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Funcionário adicionado com sucesso!');

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Erro ao adicionar funcionário');
      throw error;
    }
  }

  /**
   * Create a new employee with work schedules
   */
  async createEmployeeWithSchedule(employeeData: CreateEmployeeData): Promise<Employee> {
    try {
      const insertData = EmployeeTransformer.toSupabaseInsert(employeeData);

      const { data, error } = await supabase
        .from('employees')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Add work schedules if provided
      if (employeeData.workDays && employeeData.workDays.length > 0 && employeeData.startHour && employeeData.endHour) {
        const schedules = EmployeeTransformer.toSupabaseWorkScheduleInsert(
          data.id,
          employeeData.workDays,
          employeeData.startHour,
          employeeData.endHour
        );

        const { error: scheduleError } = await supabase
          .from('employee_work_schedules')
          .insert(schedules);

        if (scheduleError) throw scheduleError;
      }

      toast.success('Funcionário adicionado com sucesso!');

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Erro ao adicionar funcionário');
      throw error;
    }
  }

  /**
   * Update an existing employee
   */
  async updateEmployee(employeeData: UpdateEmployeeData): Promise<Employee> {
    try {
      const updateData = EmployeeTransformer.toSupabaseUpdate(employeeData);

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employeeData.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Funcionário atualizado com sucesso!');

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Erro ao atualizar funcionário');
      throw error;
    }
  }

  /**
   * Update an existing employee with work schedules
   */
  async updateEmployeeWithSchedule(employeeData: UpdateEmployeeData): Promise<Employee> {
    try {
      const updateData = EmployeeTransformer.toSupabaseUpdate(employeeData);

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employeeData.id)
        .select()
        .single();

      if (error) throw error;

      // Update work schedules if provided
      if (employeeData.workDays && employeeData.startHour && employeeData.endHour) {
        // First, delete existing schedules
        const { error: deleteError } = await supabase
          .from('employee_work_schedules')
          .delete()
          .eq('employee_id', employeeData.id);

        if (deleteError) throw deleteError;

        // Then, insert new schedules
        const schedules = EmployeeTransformer.toSupabaseWorkScheduleInsert(
          employeeData.id,
          employeeData.workDays,
          employeeData.startHour,
          employeeData.endHour
        );

        const { error: scheduleError } = await supabase
          .from('employee_work_schedules')
          .insert(schedules);

        if (scheduleError) throw scheduleError;
      }

      toast.success('Funcionário atualizado com sucesso!');

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Erro ao atualizar funcionário');
      throw error;
    }
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Funcionário removido com sucesso!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Erro ao remover funcionário');
      throw error;
    }
  }

  /**
   * Delete an employee with related data
   */
  async deleteEmployeeWithRelations(id: number): Promise<void> {
    try {
      // First, delete related schedules
      const { error: scheduleError } = await supabase
        .from('schedules')
        .delete()
        .eq('employee_id', id);

      if (scheduleError) throw scheduleError;

      // Then delete the employee
      await this.deleteEmployee(id);
    } catch (error) {
      console.error('Error deleting employee with relations:', error);
      toast.error('Erro ao remover funcionário');
      throw error;
    }
  }

  /**
   * Search employees by term
   */
  async searchEmployees(searchTerm: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;

      return data.map(EmployeeTransformer.fromSupabaseSimple);
    } catch (error) {
      console.error('Error searching employees:', error);
      toast.error('Erro ao buscar funcionários');
      throw error;
    }
  }

  /**
   * Filter employees by role and/or specialty
   */
  async filterEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    try {
      let query = supabase.from('employees').select('*');

      if (filters.role && filters.role !== '') {
        query = query.eq('role', filters.role);
      }

      if (filters.specialty && filters.specialty !== '') {
        query = query.eq('specialty', filters.specialty);
      }

      if (filters.search && filters.search.trim() !== '') {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return data.map(EmployeeTransformer.fromSupabaseSimple);
    } catch (error) {
      console.error('Error filtering employees:', error);
      toast.error('Erro ao filtrar funcionários');
      throw error;
    }
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(): Promise<EmployeeStats> {
    try {
      const employees = await this.getAllEmployees();

      const stats: EmployeeStats = {
        total: employees.length,
        byRole: {},
        bySpecialty: {},
        recent: 0
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      employees.forEach(emp => {
        // Count by role
        stats.byRole[emp.role] = (stats.byRole[emp.role] || 0) + 1;

        // Count by specialty
        if (emp.specialty) {
          stats.bySpecialty[emp.specialty] = (stats.bySpecialty[emp.specialty] || 0) + 1;
        }

        // Count recent additions
        const hireDate = new Date(emp.hireDate);
        if (hireDate >= thirtyDaysAgo) {
          stats.recent++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting employee stats:', error);
      throw error;
    }
  }

  /**
   * Validate employee data
   */
  validateEmployeeData(data: CreateEmployeeData | UpdateEmployeeData): ValidationResult {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length < 2)) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if ('email' in data && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email deve ter um formato válido');
      }
    }

    if ('phone' in data && data.phone) {
      // Usar nossa validação personalizada que aceita números puros
      if (!isValidPhone(data.phone)) {
        errors.push('Telefone deve ser um número válido (10 ou 11 dígitos)');
      }
    }

    if ('cpf' in data && data.cpf) {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(data.cpf)) {
        errors.push('CPF deve estar no formato XXX.XXX.XXX-XX');
      }
    }

    if ('workDays' in data && data.workDays && data.workDays.length === 0) {
      errors.push('Selecione pelo menos um dia de trabalho');
    }

    if ('startHour' in data && data.startHour && 'endHour' in data && data.endHour) {
      if (data.startHour >= data.endHour) {
        errors.push('Hora de entrada deve ser anterior à hora de saída');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
export default employeeService;
