// Tipos baseados no schema do Supabase
export interface Patient {
  id: string; // UUID
  fullName: string;
  cpf: string;
  birthDate: string; // DATE
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  // Campos opcionais para compatibilidade com UI
  plan?: string;
  status?: string;
  lastVisit?: string;
  nextVisit?: string;
}

// Dados para criar um novo paciente
export interface CreatePatientData {
  fullName: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  email?: string;
}

// Dados para atualizar um paciente
export interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string;
}

// Dados brutos do Supabase
export interface SupabasePatient {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

// Dados para inserir no Supabase
export interface SupabasePatientInsert {
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string | null;
  email: string | null;
}

// Dados para atualizar no Supabase
export interface SupabasePatientUpdate {
  full_name?: string;
  cpf?: string;
  birth_date?: string;
  phone?: string | null;
  email?: string | null;
}

// Filtros para busca de pacientes
export interface PatientFilters {
  search?: string;
  status?: string;
}

// Estatísticas de pacientes
export interface PatientStats {
  total: number;
  active: number;
  newThisMonth: number;
  upcomingAppointments: number;
}

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Status do paciente (para compatibilidade)
export type PatientStatus = "ativo" | "inativo" | "";
