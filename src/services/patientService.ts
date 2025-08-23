// Backend-only patient service (sem Supabase direto)
import { toast } from 'sonner';
import { isValidPhone } from '@/lib/utils';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
import type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  SupabasePatient,
  SupabasePatientInsert,
  SupabasePatientUpdate,
  PatientFilters,
  PatientStats,
  ValidationResult,
} from '@/types/patient';

export type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  PatientFilters,
  PatientStats,
  ValidationResult,
};

class PatientTransformer {
  static fromSupabase(p: SupabasePatient): Patient {
    return {
      id: p.id,
      fullName: p.full_name,
      cpf: p.cpf,
      birthDate: p.birth_date,
      phone: p.phone,
      email: p.email,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  }
  static toInsert(d: CreatePatientData): SupabasePatientInsert {
    return {
      full_name: d.fullName,
      cpf: d.cpf,
      birth_date: d.birthDate,
      phone: d.phone || null,
      email: d.email || null,
    };
  }
  static toUpdate(d: UpdatePatientData): SupabasePatientUpdate {
    const u: SupabasePatientUpdate = {};
    if (d.fullName !== undefined) u.full_name = d.fullName;
    if (d.cpf !== undefined) u.cpf = d.cpf;
    if (d.birthDate !== undefined) u.birth_date = d.birthDate;
    if (d.phone !== undefined) u.phone = d.phone || null;
    if (d.email !== undefined) u.email = d.email || null;
    return u;
  }
}

class PatientService {
  async getAllPatients(): Promise<Patient[]> {
    try {
      const rows = await apiGet<SupabasePatient[]>('/api/patients');
      return rows.map(PatientTransformer.fromSupabase);
    } catch (e) {
      console.error('Error fetching patients', e);
      toast.error('Erro ao carregar pacientes');
      throw e;
    }
  }

  async getPatientById(id: string): Promise<Patient | null> {
    try {
      const row = await apiGet<SupabasePatient>(`/api/patients/${id}`);
      return PatientTransformer.fromSupabase(row);
    } catch (e) {
      console.error('Error fetching patient', e);
      toast.error('Erro ao carregar paciente');
      throw e;
    }
  }

  async createPatient(data: CreatePatientData): Promise<Patient> {
    try {
      const payload = PatientTransformer.toInsert(data);
      const created = await apiPost<SupabasePatient>('/api/patients', payload);
      toast.success('Paciente criado');
      return PatientTransformer.fromSupabase(created);
    } catch (e) {
      console.error('Error creating patient', e);
      toast.error('Erro ao adicionar paciente');
      throw e;
    }
  }

  async updatePatient(data: UpdatePatientData): Promise<Patient> {
    try {
      const payload = PatientTransformer.toUpdate(data);
      const updated = await apiPut<SupabasePatient>(
        `/api/patients/${data.id}`,
        payload
      );
      toast.success('Paciente atualizado');
      return PatientTransformer.fromSupabase(updated);
    } catch (e) {
      console.error('Error updating patient', e);
      toast.error('Erro ao atualizar paciente');
      throw e;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      await apiDelete(`/api/patients/${id}`);
      toast.success('Paciente removido');
    } catch (e) {
      console.error('Error deleting patient', e);
      toast.error('Erro ao remover paciente');
      throw e;
    }
  }

  async searchPatients(term: string): Promise<Patient[]> {
    const all = await this.getAllPatients();
    const t = term.trim().toLowerCase();
    if (!t) return all;
    return all.filter(
      (p) =>
        p.fullName.toLowerCase().includes(t) ||
        p.cpf.replace(/\D/g, '').includes(t.replace(/\D/g, ''))
    );
  }

  async filterPatients(filters: PatientFilters): Promise<Patient[]> {
    const all = await this.getAllPatients();
    return all.filter((p) => {
      if (filters.search) {
        const t = filters.search.toLowerCase();
        if (
          !(
            p.fullName.toLowerCase().includes(t) ||
            p.cpf.replace(/\D/g, '').includes(t.replace(/\D/g, ''))
          )
        )
          return false;
      }
      if (filters.dateFrom && p.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && p.createdAt > filters.dateTo) return false;
      return true;
    });
  }

  async getPatientStats(): Promise<PatientStats> {
    const all = await this.getAllPatients();
    const total = all.length;
    const active = total; // sem status específico ainda
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = all.filter(
      (p) => new Date(p.createdAt) >= startOfMonth
    ).length;
    // Ainda não temos consultas vinculadas aqui; placeholder 0
    const upcomingAppointments = 0;
    return { total, active, newThisMonth, upcomingAppointments };
  }

  validatePatientData(
    data: CreatePatientData | UpdatePatientData
  ): ValidationResult {
    const errors: string[] = [];
    if (!data.fullName?.trim()) errors.push('Nome completo é obrigatório');
    if (!data.cpf?.trim()) errors.push('CPF é obrigatório');
    else if (!this.isValidCPF(data.cpf)) errors.push('CPF inválido');
    if (!data.birthDate) errors.push('Data de nascimento é obrigatória');
    else if (new Date(data.birthDate) > new Date())
      errors.push('Data de nascimento no futuro');
    if (data.phone && !isValidPhone(data.phone))
      errors.push('Telefone inválido');
    if (data.email && !this.isValidEmail(data.email))
      errors.push('E-mail inválido');
    return { isValid: errors.length === 0, errors };
  }

  private isValidCPF(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(clean[10])) return false;
    return true;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Export singleton instance
export const patientService = new PatientService();

// Legacy functions for backward compatibility
// Helpers legados simplificados
export const normalizeText = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const searchPatients = (patients: Patient[], term: string) => {
  const n = normalizeText(term);
  if (!n) return patients;
  return patients.filter((p) =>
    [p.fullName, p.email || '', p.phone || '']
      .map(normalizeText)
      .some((f) => f.includes(n))
  );
};

export const filterPatientsByStatus = (patients: Patient[]) => patients; // placeholder
