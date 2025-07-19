import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { isValidPhone, onlyNumbers } from '@/lib/utils';
import type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  SupabasePatient,
  SupabasePatientInsert,
  SupabasePatientUpdate,
  PatientFilters,
  PatientStats,
  ValidationResult
} from '@/types/patient';

// Re-export types for backward compatibility
export type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  PatientFilters,
  PatientStats,
  ValidationResult
};

/**
 * Utility functions for data transformation
 */
class PatientTransformer {
  /**
   * Transform Supabase patient data to app Patient interface
   */
  static fromSupabase(supabasePatient: SupabasePatient): Patient {
    return {
      id: supabasePatient.id,
      fullName: supabasePatient.full_name,
      cpf: supabasePatient.cpf,
      birthDate: supabasePatient.birth_date,
      phone: supabasePatient.phone,
      email: supabasePatient.email,
      address: supabasePatient.address,
      createdAt: supabasePatient.created_at,
      updatedAt: supabasePatient.updated_at
    };
  }

  /**
   * Transform CreatePatientData to Supabase insert format
   */
  static toSupabaseInsert(patientData: CreatePatientData): SupabasePatientInsert {
    return {
      full_name: patientData.fullName,
      cpf: patientData.cpf,
      birth_date: patientData.birthDate,
      phone: patientData.phone || null,
      email: patientData.email || null,
      address: patientData.address || null
    };
  }

  /**
   * Transform UpdatePatientData to Supabase update format
   */
  static toSupabaseUpdate(patientData: UpdatePatientData): SupabasePatientUpdate {
    const updateData: SupabasePatientUpdate = {};

    // Only include fields that are provided
    if (patientData.fullName !== undefined) updateData.full_name = patientData.fullName;
    if (patientData.cpf !== undefined) updateData.cpf = patientData.cpf;
    if (patientData.birthDate !== undefined) updateData.birth_date = patientData.birthDate;
    if (patientData.phone !== undefined) updateData.phone = patientData.phone || null;
    if (patientData.email !== undefined) updateData.email = patientData.email || null;
    if (patientData.address !== undefined) updateData.address = patientData.address || null;

    return updateData;
  }
}

class PatientService {
  /**
   * Fetch all patients from database
   */
  async getAllPatients(): Promise<Patient[]> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');

      if (error) throw error;

      return data.map(PatientTransformer.fromSupabase);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Erro ao carregar pacientes');
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return PatientTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      toast.error('Erro ao carregar paciente');
      throw error;
    }
  }

  /**
   * Create a new patient
   */
  async createPatient(patientData: CreatePatientData): Promise<Patient> {
    try {
      const insertData = PatientTransformer.toSupabaseInsert(patientData);

      const { data, error } = await supabase
        .from('patients')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Paciente adicionado com sucesso!');

      return PatientTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error('Erro ao adicionar paciente');
      throw error;
    }
  }

  /**
   * Update an existing patient
   */
  async updatePatient(patientData: UpdatePatientData): Promise<Patient> {
    try {
      const updateData = PatientTransformer.toSupabaseUpdate(patientData);

      const { data, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patientData.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Paciente atualizado com sucesso!');

      return PatientTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Erro ao atualizar paciente');
      throw error;
    }
  }

  /**
   * Delete a patient
   */
  async deletePatient(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Paciente removido com sucesso!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Erro ao remover paciente');
      throw error;
    }
  }

  /**
   * Search patients by term
   */
  async searchPatients(searchTerm: string): Promise<Patient[]> {
    try {
      if (!searchTerm.trim()) {
        return this.getAllPatients();
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('full_name');

      if (error) throw error;

      return data.map(PatientTransformer.fromSupabase);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Erro ao buscar pacientes');
      throw error;
    }
  }

  /**
   * Filter patients by various criteria
   */
  async filterPatients(filters: PatientFilters): Promise<Patient[]> {
    try {
      let query = supabase
        .from('patients')
        .select('*');

      // Apply search filter
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('full_name');

      if (error) throw error;

      return data.map(PatientTransformer.fromSupabase);
    } catch (error) {
      console.error('Error filtering patients:', error);
      toast.error('Erro ao filtrar pacientes');
      throw error;
    }
  }

  /**
   * Get patient statistics
   */
  async getPatientStats(): Promise<PatientStats> {
    try {
      // Get total patients
      const { count: total, error: totalError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get patients created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newThisMonth, error: monthError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      if (monthError) throw monthError;

      // Get upcoming appointments count
      const { count: upcomingAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', new Date().toISOString())
        .eq('status', 'agendada');

      if (appointmentsError) throw appointmentsError;

      return {
        total: total || 0,
        active: total || 0, // All patients are considered active for now
        newThisMonth: newThisMonth || 0,
        upcomingAppointments: upcomingAppointments || 0
      };
    } catch (error) {
      console.error('Error getting patient stats:', error);
      toast.error('Erro ao carregar estatísticas');
      throw error;
    }
  }

  /**
   * Validate patient data
   */
  validatePatientData(data: CreatePatientData | UpdatePatientData): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!data.fullName?.trim()) {
      errors.push('Nome completo é obrigatório');
    }

    if (!data.cpf?.trim()) {
      errors.push('CPF é obrigatório');
    } else if (!this.isValidCPF(data.cpf)) {
      errors.push('CPF inválido');
    }

    if (!data.birthDate) {
      errors.push('Data de nascimento é obrigatória');
    } else {
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.push('Data de nascimento não pode ser no futuro');
      }
    }

    // Validate optional fields
    if (data.phone && !isValidPhone(data.phone)) {
      errors.push('Telefone inválido');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('E-mail inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate CPF format and checksum
   */
  private isValidCPF(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');

    // Check if it has 11 digits
    if (cleanCPF.length !== 11) return false;

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validate checksum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const patientService = new PatientService();

// Legacy functions for backward compatibility
export const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim();
};

export const searchPatients = (patients: Patient[], searchTerm: string) => {
  if (!searchTerm.trim()) return patients;

  const normalizedSearch = normalizeText(searchTerm);

  return patients.filter(patient => {
    // Campos pesquisáveis normalizados
    const searchableFields = [
      normalizeText(patient.fullName),
      normalizeText(patient.email || ''),
      patient.phone?.replace(/\D/g, "") || '', // Apenas números
    ];

    // Verifica se o termo está presente em qualquer campo
    return searchableFields.some(field => field.includes(normalizedSearch));
  });
};

export const filterPatientsByStatus = (patients: Patient[], status: string) => {
  if (!status) return patients;
  // For now, all patients are considered active
  return patients;
};
