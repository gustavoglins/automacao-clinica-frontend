import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { isValidPhone, onlyNumbers } from "@/lib/utils";
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
} from "@/types/employee";
import { WEEKDAY_MAP, REVERSE_WEEKDAY_MAP } from "@/types/employee";

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
        Dentista: "dentista",
        Assistente: "auxiliar_saude_bucal",
        Recepcionista: "recepcionista",
        Gerente: "gerente",
        Auxiliar: "auxiliar_saude_bucal",
        Ortodontista: "ortodontista",
        Endodontista: "endodontista",
        Periodontista: "periodontista",
        Implantodontista: "implantodontista",
        Cirurgião: "cirurgiao_buco_maxilo",
        Higienista: "higienista",
        Técnico: "tecnico_saude_bucal",
      };
      return roleMap[role] || "dentista";
    };

    const mapSpecialtyToEnum = (specialty: string): string | null => {
      if (!specialty) return null;

      // Mapeamento completo para specialty_type
      const specialtyMap: Record<string, string> = {
        "Clínico Geral": "clinico_geral",
        Ortodontia: "ortodontista",
        Endodontia: "endodontista",
        Implantodontia: "implantodontista",
        Periodontia: "periodontista",
        Prótese: "protesista",
        Odontopediatria: "odontopediatra",
        "Cirurgia Buco-Maxilo": "cirurgiao_buco_maxilo",
        Radiologia: "radiologista",
        "Patologia Bucal": "patologista_bucal",
        Dentística: "dentistica",
        Estomatologia: "estomatologista",
        "DTM (Disfunções Temporomandibulares)":
          "disfuncoes_temporomandibulares",
        Odontogeriatria: "odontogeriatra",
        "Odontologia do Trabalho": "odontologia_do_trabalho",
        "Odontologia Legal": "odontologia_legal",
        "Odontologia Hospitalar": "odontologia_hospitalar",
        "Odontologia do Esporte": "odontologia_do_esporte",
        "Necessidades Especiais": "necessidades_especiais",
        "Ortopedia Funcional": "ortopedia_funcional",
        "Saúde Coletiva": "saude_coletiva",
        "Acupuntura Odonto": "acupuntura_odonto",
        "Homeopatia Odonto": "homeopatia_odonto",
        Laserterapia: "laserterapia",
        "Odontologia Estética": "odontologia_estetica",
      };
      // Permitir salvar diretamente se já estiver no formato do banco
      if (Object.values(specialtyMap).includes(specialty)) return specialty;
      return specialtyMap[specialty] || null;
    };

    const mapStatusToEnum = (status: string): string => {
      const statusMap: Record<string, string> = {
        ativo: "ativo",
        inativo: "demitido",
        suspenso: "afastado",
      };
      return statusMap[status] || "ativo";
    };

    // Limpar CPF - remover pontos e traços
    const cleanCpf = employeeData.cpf
      ? employeeData.cpf.replace(/\D/g, "")
      : "";

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
      status: mapStatusToEnum(employeeData.status || "ativo"),
      specialty: mapSpecialtyToEnum(employeeData.specialty || ""),
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
  /**
   * Fetch all employees from database
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      console.log("🔄 Buscando funcionários...");

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("full_name");

      if (error) {
        console.error("❌ Erro ao buscar funcionários:", error);
        throw error;
      }

      console.log("📊 Dados brutos do Supabase:", data);

      const employees = data.map(EmployeeTransformer.fromSupabaseSimple);
      console.log("👥 Funcionários processados:", employees);

      return employees;
    } catch (error) {
      console.error("❌ Erro ao carregar funcionários:", error);
      toast.error("Erro ao carregar funcionários");
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error("Error fetching employee by ID:", error);
      toast.error("Erro ao carregar funcionário");
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
        .from("employees")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success("Funcionário adicionado com sucesso!");

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Erro ao adicionar funcionário");
      throw error;
    }
  }

  /**
   * Create a new employee with work schedules
   */
  async createEmployeeWithSchedule(
    employeeData: CreateEmployeeData
  ): Promise<Employee> {
    try {
      console.log("🔄 Tentando criar funcionário com dados:", employeeData);

      const insertData = EmployeeTransformer.toSupabaseInsert(employeeData);
      console.log("📝 Dados para inserção:", insertData);

      const { data, error } = await supabase
        .from("employees")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("❌ Erro ao criar funcionário:", error);
        throw error;
      }

      console.log("✅ Funcionário criado com sucesso:", data);

      // Add work schedules if provided
      if (
        employeeData.workDays &&
        employeeData.workDays.length > 0 &&
        employeeData.startHour &&
        employeeData.endHour
      ) {
        console.log("🕐 Criando horários de trabalho...");

        const schedules = EmployeeTransformer.toSupabaseWorkScheduleInsert(
          data.id,
          employeeData.workDays,
          employeeData.startHour,
          employeeData.endHour
        );

        console.log("📅 Horários para inserir:", schedules);

        const { error: scheduleError } = await supabase
          .from("work_hours")
          .insert(schedules);

        if (scheduleError) {
          console.error("❌ Erro ao criar horários:", scheduleError);
          throw scheduleError;
        }

        console.log("✅ Horários criados com sucesso");
      }

      toast.success("Funcionário adicionado com sucesso!");

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error("❌ Erro ao criar funcionário:", error);
      toast.error("Erro ao adicionar funcionário");
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
        .from("employees")
        .update(updateData)
        .eq("id", employeeData.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Funcionário atualizado com sucesso!");

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Erro ao atualizar funcionário");
      throw error;
    }
  }

  /**
   * Update an existing employee with work schedules
   */
  async updateEmployeeWithSchedule(
    employeeData: UpdateEmployeeData
  ): Promise<Employee> {
    try {
      const updateData = EmployeeTransformer.toSupabaseUpdate(employeeData);

      const { data, error } = await supabase
        .from("employees")
        .update(updateData)
        .eq("id", employeeData.id)
        .select()
        .single();

      if (error) throw error;

      // Update work schedules if provided
      if (
        employeeData.workDays &&
        employeeData.startHour &&
        employeeData.endHour
      ) {
        // First, delete existing schedules
        const { error: deleteError } = await supabase
          .from("work_hours")
          .delete()
          .eq("employee_id", employeeData.id);

        if (deleteError) throw deleteError;

        // Then, insert new schedules
        const schedules = EmployeeTransformer.toSupabaseWorkScheduleInsert(
          employeeData.id.toString(),
          employeeData.workDays,
          employeeData.startHour,
          employeeData.endHour
        );

        const { error: scheduleError } = await supabase
          .from("work_hours")
          .insert(schedules);

        if (scheduleError) throw scheduleError;
      }

      toast.success("Funcionário atualizado com sucesso!");

      return EmployeeTransformer.fromSupabase(data);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Erro ao atualizar funcionário");
      throw error;
    }
  }

  /**
   * Delete an employee
   */
  async deleteEmployee(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) {
        console.error("Supabase error ao deletar funcionário:", error);
        toast.error(`Erro ao remover funcionário: ${error.message}`);
        throw error;
      }

      // Sempre mostrar toast de sucesso se não houve erro
      toast.success("Funcionário removido com sucesso!");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error deleting employee:", error);
      toast.error(`Erro ao remover funcionário: ${errMsg}`);
      throw error;
    }
  }

  /**
   * Delete an employee with related data
   */
  async deleteEmployeeWithRelations(id: string): Promise<void> {
    try {
      // First, delete related work schedules
      const { error: scheduleError } = await supabase
        .from("work_hours")
        .delete()
        .eq("employee_id", id);

      if (scheduleError) {
        console.error(
          "Erro ao deletar horários do funcionário:",
          scheduleError
        );
        toast.error(
          `Erro ao remover horários do funcionário: ${scheduleError.message}`
        );
        throw scheduleError;
      }

      // TODO: Adicionar deleção de outros dados relacionados se necessário

      // Then delete the employee
      await this.deleteEmployee(id);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Error deleting employee with relations:", error);
      toast.error(`Erro ao remover funcionário: ${errMsg}`);
      throw error;
    }
  }

  /**
   * Search employees by term
   */
  async searchEmployees(searchTerm: string): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        )
        .order("full_name");

      if (error) throw error;

      return data.map(EmployeeTransformer.fromSupabaseSimple);
    } catch (error) {
      console.error("Error searching employees:", error);
      toast.error("Erro ao buscar funcionários");
      throw error;
    }
  }

  /**
   * Filter employees by role and/or specialty
   */
  async filterEmployees(filters: EmployeeFilters): Promise<Employee[]> {
    try {
      let query = supabase.from("employees").select("*");

      if (filters.role && filters.role !== "") {
        query = query.eq("role", filters.role);
      }

      if (filters.specialty && filters.specialty !== "") {
        query = query.eq("specialty", filters.specialty);
      }

      if (filters.search && filters.search.trim() !== "") {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query.order("full_name");

      if (error) throw error;

      return data.map(EmployeeTransformer.fromSupabaseSimple);
    } catch (error) {
      console.error("Error filtering employees:", error);
      toast.error("Erro ao filtrar funcionários");
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
        recent: 0,
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      employees.forEach((emp) => {
        // Count by role
        stats.byRole[emp.role] = (stats.byRole[emp.role] || 0) + 1;

        // Count by specialty
        if (emp.specialty) {
          stats.bySpecialty[emp.specialty] =
            (stats.bySpecialty[emp.specialty] || 0) + 1;
        }

        // Count recent additions
        const hireDate = new Date(emp.hiredAt);
        if (hireDate >= thirtyDaysAgo) {
          stats.recent++;
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting employee stats:", error);
      throw error;
    }
  }

  /**
   * Validate employee data
   */
  validateEmployeeData(
    data: CreateEmployeeData | UpdateEmployeeData
  ): ValidationResult {
    const errors: string[] = [];

    if (
      "fullName" in data &&
      (!data.fullName || data.fullName.trim().length < 2)
    ) {
      errors.push("Nome deve ter pelo menos 2 caracteres");
    }

    if ("email" in data && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Email deve ter um formato válido");
      }
    }

    if ("phone" in data && data.phone) {
      // Usar nossa validação personalizada que aceita números puros
      if (!isValidPhone(data.phone)) {
        errors.push("Telefone deve ser um número válido (10 ou 11 dígitos)");
      }
    }

    if ("cpf" in data && data.cpf) {
      // CPF deve ter exatamente 11 dígitos numéricos
      const cleanCpf = data.cpf.replace(/\D/g, "");
      if (cleanCpf.length !== 11) {
        errors.push("CPF deve ter exatamente 11 dígitos");
      } else if (!/^\d{11}$/.test(cleanCpf)) {
        errors.push("CPF deve conter apenas números");
      }
    }

    if ("workDays" in data && data.workDays && data.workDays.length === 0) {
      errors.push("Selecione pelo menos um dia de trabalho");
    }

    if (
      "startHour" in data &&
      data.startHour &&
      "endHour" in data &&
      data.endHour
    ) {
      if (data.startHour >= data.endHour) {
        errors.push("Hora de entrada deve ser anterior à hora de saída");
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
