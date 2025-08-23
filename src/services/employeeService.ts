// Backend-only employee service (sem fallback Supabase)
import { toast } from 'sonner';
import { isValidPhone } from '@/lib/utils';
import { webhookService, WebhookOperation } from './webhookService';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
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
  ValidationResult,
} from '@/types/employee';
import { WEEKDAY_MAP, REVERSE_WEEKDAY_MAP } from '@/types/employee';

// Re-export types for backward compatibility
export type {
  Employee,
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFilters,
  EmployeeStats,
  ValidationResult,
};

/**
 * Utility functions for data transformation
 */
class EmployeeTransformer {
  /**
   * Transform Supabase employee data to app Employee interface
   */
  static fromSupabase(
    supabaseEmployee: SupabaseEmployee,
    workSchedules?: SupabaseEmployeeWorkSchedule[]
  ): Employee {
    const employee: Employee = {
      id: supabaseEmployee.id,
      fullName: supabaseEmployee.full_name,
      cpf: supabaseEmployee.cpf,
      role: supabaseEmployee.role,
      status: supabaseEmployee.status,
      specialty: supabaseEmployee.specialty,
      crmNumber: supabaseEmployee.crm_number,
      salary: supabaseEmployee.salary,
      phone: supabaseEmployee.phone,
      email: supabaseEmployee.email,
      hiredAt: supabaseEmployee.hired_at,
      createdAt: supabaseEmployee.created_at,
      updatedAt: supabaseEmployee.updated_at,
    };

    // Add work schedule if provided
    if (workSchedules && workSchedules.length > 0) {
      employee.workDays = workSchedules.map(
        (schedule) => REVERSE_WEEKDAY_MAP[schedule.weekday]
      );
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
  static toSupabaseInsert(
    employeeData: CreateEmployeeData
  ): SupabaseEmployeeInsert {
    // Mapear valores do frontend para os ENUMs do banco
    const mapRoleToEnum = (role: string): string => {
      const roleMap: Record<string, string> = {
        // Valores do frontend (enum format)
        dentista: 'dentista',
        ortodontista: 'ortodontista',
        endodontista: 'endodontista',
        periodontista: 'periodontista',
        implantodontista: 'implantodontista',
        protesista: 'protesista',
        odontopediatra: 'odontopediatra',
        cirurgiao_buco_maxilo: 'cirurgiao_buco_maxilo',
        auxiliar_saude_bucal: 'auxiliar_saude_bucal',
        recepcionista: 'recepcionista',
        gerente: 'gerente',
        higienista: 'higienista',
        tecnico_saude_bucal: 'tecnico_saude_bucal',
        // Valores antigos para compatibilidade (primeira letra maiúscula)
        Dentista: 'dentista',
        Assistente: 'auxiliar_saude_bucal',
        Recepcionista: 'recepcionista',
        Gerente: 'gerente',
        Auxiliar: 'auxiliar_saude_bucal',
        Ortodontista: 'ortodontista',
        Endodontista: 'endodontista',
        Periodontista: 'periodontista',
        Implantodontista: 'implantodontista',
        Cirurgião: 'cirurgiao_buco_maxilo',
        Higienista: 'higienista',
        Técnico: 'tecnico_saude_bucal',
      };
      return roleMap[role] || 'dentista';
    };

    const mapSpecialtyToEnum = (specialty: string): string | null => {
      if (!specialty) return null;

      // Mapeamento completo para specialty_type
      const specialtyMap: Record<string, string> = {
        'Clínico Geral': 'clinico_geral',
        Ortodontia: 'ortodontista',
        Endodontia: 'endodontista',
        Implantodontia: 'implantodontista',
        Periodontia: 'periodontista',
        Prótese: 'protesista',
        Odontopediatria: 'odontopediatra',
        'Cirurgia Buco-Maxilo': 'cirurgiao_buco_maxilo',
        Radiologia: 'radiologista',
        'Patologia Bucal': 'patologista_bucal',
        Dentística: 'dentistica',
        Estomatologia: 'estomatologista',
        'DTM (Disfunções Temporomandibulares)':
          'disfuncoes_temporomandibulares',
        Odontogeriatria: 'odontogeriatra',
        'Odontologia do Trabalho': 'odontologia_do_trabalho',
        'Odontologia Legal': 'odontologia_legal',
        'Odontologia Hospitalar': 'odontologia_hospitalar',
        'Odontologia do Esporte': 'odontologia_do_esporte',
        'Necessidades Especiais': 'necessidades_especiais',
        'Ortopedia Funcional': 'ortopedia_funcional',
        'Saúde Coletiva': 'saude_coletiva',
        'Acupuntura Odonto': 'acupuntura_odonto',
        'Homeopatia Odonto': 'homeopatia_odonto',
        Laserterapia: 'laserterapia',
        'Odontologia Estética': 'odontologia_estetica',
      };
      // Permitir salvar diretamente se já estiver no formato do banco
      if (Object.values(specialtyMap).includes(specialty)) return specialty;
      return specialtyMap[specialty] || null;
    };

    const mapStatusToEnum = (status: string): string => {
      const statusMap: Record<string, string> = {
        ativo: 'ativo',
        inativo: 'demitido',
        suspenso: 'afastado',
      };
      return statusMap[status] || 'ativo';
    };

    // Limpar CPF - remover pontos e traços
    const cleanCpf = employeeData.cpf
      ? employeeData.cpf.replace(/\D/g, '')
      : '';

    // Validar se o CPF tem 11 dígitos
    if (cleanCpf && cleanCpf.length !== 11) {
      throw new Error(
        `CPF deve ter 11 dígitos. Recebido: ${cleanCpf.length} dígitos`
      );
    }

    return {
      full_name: employeeData.fullName,
      cpf: cleanCpf,
      role: mapRoleToEnum(employeeData.role),
      status: mapStatusToEnum(employeeData.status || 'ativo'),
      specialty: mapSpecialtyToEnum(employeeData.specialty || ''),
      crm_number: employeeData.crmNumber || null,
      salary: employeeData.salary || null,
      phone: employeeData.phone || null,
      email: employeeData.email || null,
      hired_at: employeeData.hiredAt,
    };
  }

  /**
   * Transform work schedule data to Supabase insert format
   */
  static toSupabaseWorkScheduleInsert(
    employeeId: string,
    workDays: string[],
    startHour: string,
    endHour: string
  ): Array<{
    employee_id: string;
    weekday: number;
    start_time: string;
    end_time: string;
  }> {
    return workDays.map((day) => ({
      employee_id: employeeId,
      weekday: WEEKDAY_MAP[day],
      start_time: startHour,
      end_time: endHour,
    }));
  }

  /**
   * Transform UpdateEmployeeData to Supabase update format
   */
  static toSupabaseUpdate(
    employeeData: UpdateEmployeeData
  ): SupabaseEmployeeUpdate {
    const updateData: SupabaseEmployeeUpdate = {};

    // Only include fields that are provided
    if (employeeData.fullName !== undefined)
      updateData.full_name = employeeData.fullName;
    if (employeeData.cpf !== undefined) updateData.cpf = employeeData.cpf;
    if (employeeData.role !== undefined) updateData.role = employeeData.role;
    if (employeeData.status !== undefined)
      updateData.status = employeeData.status;
    if (employeeData.specialty !== undefined)
      updateData.specialty = employeeData.specialty || null;
    if (employeeData.crmNumber !== undefined)
      updateData.crm_number = employeeData.crmNumber || null;
    if (employeeData.salary !== undefined)
      updateData.salary = employeeData.salary || null;
    if (employeeData.phone !== undefined)
      updateData.phone = employeeData.phone || null;
    if (employeeData.email !== undefined)
      updateData.email = employeeData.email || null;
    if (employeeData.hiredAt !== undefined)
      updateData.hired_at = employeeData.hiredAt;

    return updateData;
  }
}

class EmployeeService {
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const data = await apiGet<
        (SupabaseEmployee & { work_hours?: SupabaseEmployeeWorkSchedule[] })[]
      >('/api/employees');
      return data.map((e) =>
        EmployeeTransformer.fromSupabase(e, e.work_hours || [])
      );
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
      throw error;
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const data = await apiGet<
        SupabaseEmployee & { work_hours?: SupabaseEmployeeWorkSchedule[] }
      >(`/api/employees/${id}`);
      return EmployeeTransformer.fromSupabase(data, data.work_hours);
    } catch (error) {
      console.error('Erro ao buscar funcionário:', error);
      toast.error('Erro ao carregar funcionário');
      throw error;
    }
  }

  async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    try {
      const insertData = EmployeeTransformer.toSupabaseInsert(employeeData);
      const created = await apiPost<
        SupabaseEmployee & { work_hours?: SupabaseEmployeeWorkSchedule[] }
      >('/api/employees', {
        ...insertData,
        work_days: employeeData.workDays?.map((d) => WEEKDAY_MAP[d]),
        start_time: employeeData.startHour,
        end_time: employeeData.endHour,
      });
      toast.success('Funcionário adicionado');
      await webhookService.notifyEmployees(WebhookOperation.INSERT);
      return EmployeeTransformer.fromSupabase(created, created.work_hours);
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      toast.error('Erro ao adicionar funcionário');
      throw error;
    }
  }

  async updateEmployee(employeeData: UpdateEmployeeData): Promise<Employee> {
    try {
      const updateData = EmployeeTransformer.toSupabaseUpdate(employeeData);
      const updated = await apiPut<
        SupabaseEmployee & { work_hours?: SupabaseEmployeeWorkSchedule[] }
      >(`/api/employees/${employeeData.id}`, {
        ...updateData,
        work_days: employeeData.workDays?.map((d) => WEEKDAY_MAP[d]),
        start_time: employeeData.startHour,
        end_time: employeeData.endHour,
      });
      toast.success('Funcionário atualizado');
      await webhookService.notifyEmployees(WebhookOperation.UPDATE);
      return EmployeeTransformer.fromSupabase(updated, updated.work_hours);
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      toast.error('Erro ao atualizar funcionário');
      throw error;
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      await apiDelete(`/api/employees/${id}`);
      toast.success('Funcionário removido');
      await webhookService.notifyEmployees(WebhookOperation.DELETE, id);
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      toast.error('Erro ao remover funcionário');
      throw error;
    }
  }

  /**
   * Delete an employee with related data
   */
  async deleteEmployeeWithRelations(id: string): Promise<void> {
    // Backend deverá cuidar de relações; chamamos delete simples
    return this.deleteEmployee(id);
  }

  async searchEmployees(searchTerm: string): Promise<Employee[]> {
    const term = searchTerm.trim().toLowerCase();
    const all = await this.getAllEmployees();
    if (!term) return all;
    return all.filter((e) =>
      [e.fullName, e.email || '', e.phone || '']
        .map((f) => f.toLowerCase())
        .some((f) => f.includes(term))
    );
  }

  async filterEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    const all = await this.getAllEmployees();
    return all.filter((e) => {
      if (filters.role && filters.role !== '' && e.role !== filters.role)
        return false;
      if (
        filters.specialty &&
        filters.specialty !== '' &&
        e.specialty !== filters.specialty
      )
        return false;
      if (filters.search && filters.search.trim() !== '') {
        const t = filters.search.toLowerCase();
        if (
          ![e.fullName, e.email || '', e.phone || '']
            .map((f) => f.toLowerCase())
            .some((f) => f.includes(t))
        )
          return false;
      }
      return true;
    });
  }

  async getEmployeeStats(): Promise<EmployeeStats> {
    const employees = await this.getAllEmployees();
    const stats: EmployeeStats = {
      total: employees.length,
      byRole: {},
      bySpecialty: {},
      recent: 0,
    };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    employees.forEach((e) => {
      stats.byRole[e.role] = (stats.byRole[e.role] || 0) + 1;
      if (e.specialty)
        stats.bySpecialty[e.specialty] =
          (stats.bySpecialty[e.specialty] || 0) + 1;
      if (new Date(e.hiredAt) >= thirtyDaysAgo) stats.recent++;
    });
    return stats;
  }

  /**
   * Validate employee data
   */
  validateEmployeeData(
    data: CreateEmployeeData | UpdateEmployeeData
  ): ValidationResult {
    const errors: string[] = [];

    if (
      'fullName' in data &&
      (!data.fullName || data.fullName.trim().length < 2)
    ) {
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
      // CPF deve ter exatamente 11 dígitos numéricos
      const cleanCpf = data.cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        errors.push('CPF deve ter exatamente 11 dígitos');
      } else if (!/^\d{11}$/.test(cleanCpf)) {
        errors.push('CPF deve conter apenas números');
      }
    }

    if ('workDays' in data && data.workDays && data.workDays.length === 0) {
      errors.push('Selecione pelo menos um dia de trabalho');
    }

    if (
      'startHour' in data &&
      data.startHour &&
      'endHour' in data &&
      data.endHour
    ) {
      if (data.startHour >= data.endHour) {
        errors.push('Hora de entrada deve ser anterior à hora de saída');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
export default employeeService;
