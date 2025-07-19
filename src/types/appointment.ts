// Tipos baseados no schema do Supabase para agendamentos
export interface Appointment {
  id: string; // UUID
  patientId: string;
  employeeId: string;
  serviceId: number;
  appointmentAt: string; // TIMESTAMP WITH TIME ZONE
  appointmentEnd: string; // TIMESTAMP WITH TIME ZONE
  status: string;
  createdAt: string;
  updatedAt: string;

  // Dados relacionados (para joins)
  patient?: {
    fullName: string;
    phone: string | null;
    email: string | null;
  };
  employee?: {
    fullName: string;
    role: string;
  };
  service?: {
    name: string;
    durationMinutes: number;
    price: number;
  };
}

// Dados para criar um novo agendamento
export interface CreateAppointmentData {
  patientId: string;
  employeeId: string;
  serviceId: number;
  appointmentAt: string;
  appointmentEnd: string;
  status?: string;
}

// Dados para atualizar um agendamento
export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  id: string;
}

// Dados brutos do Supabase
export interface SupabaseAppointment {
  id: string;
  patient_id: string;
  employee_id: string;
  service_id: number;
  appointment_at: string;
  appointment_end: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Dados para inserir no Supabase
export interface SupabaseAppointmentInsert {
  patient_id: string;
  employee_id: string;
  service_id: number;
  appointment_at: string;
  appointment_end: string;
  status: string;
}

// Dados para atualizar no Supabase
export interface SupabaseAppointmentUpdate {
  patient_id?: string;
  employee_id?: string;
  service_id?: number;
  appointment_at?: string;
  appointment_end?: string;
  status?: string;
}

// Filtros para busca de agendamentos
export interface AppointmentFilters {
  search?: string;
  status?: string;
  employeeId?: string;
  serviceId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  timeRange?: string;
}

// Estatísticas de agendamentos
export interface AppointmentStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<string, number>;
  byEmployee: Record<string, number>;
}

// Status de agendamento (baseados no ENUM do banco)
export enum AppointmentStatus {
  AGENDADA = 'agendada',
  CONFIRMADA = 'confirmada',
  REAGENDADA = 'reagendada',
  CANCELADA = 'cancelada',
  NAO_COMPARECEU = 'nao_compareceu',
  EM_ANDAMENTO = 'em_andamento',
  REALIZADA = 'realizada'
}

// Mapeamento de status para exibição
export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  [AppointmentStatus.AGENDADA]: 'Agendada',
  [AppointmentStatus.CONFIRMADA]: 'Confirmada',
  [AppointmentStatus.REAGENDADA]: 'Reagendada',
  [AppointmentStatus.CANCELADA]: 'Cancelada',
  [AppointmentStatus.NAO_COMPARECEU]: 'Não Compareceu',
  [AppointmentStatus.EM_ANDAMENTO]: 'Em Andamento',
  [AppointmentStatus.REALIZADA]: 'Realizada'
};

// Cores para cada status
export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  [AppointmentStatus.AGENDADA]: 'bg-blue-100 text-blue-800',
  [AppointmentStatus.CONFIRMADA]: 'bg-green-100 text-green-800',
  [AppointmentStatus.REAGENDADA]: 'bg-yellow-100 text-yellow-800',
  [AppointmentStatus.CANCELADA]: 'bg-red-100 text-red-800',
  [AppointmentStatus.NAO_COMPARECEU]: 'bg-gray-100 text-gray-800',
  [AppointmentStatus.EM_ANDAMENTO]: 'bg-purple-100 text-purple-800',
  [AppointmentStatus.REALIZADA]: 'bg-emerald-100 text-emerald-800'
};

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
} 