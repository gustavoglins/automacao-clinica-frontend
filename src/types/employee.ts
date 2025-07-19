/**
 * Employee-related TypeScript interfaces and types
 */

// Base Employee interface - represents the complete employee object
export interface Employee {
  id: string; // UUID
  fullName: string;
  cpf: string;
  role: string;
  status: string;
  specialty: string | null;
  crmNumber: string | null;
  salary: number | null;
  phone: string | null;
  email: string | null;
  hiredAt: string; // DATE
  createdAt: string;
  updatedAt: string;

  // Dados de horário de trabalho (opcional)
  workDays?: string[]; // Dias de trabalho: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  startHour?: string; // Hora de entrada: "08:00"
  endHour?: string; // Hora de saída: "18:00"
}

// Data required to create a new employee
export interface CreateEmployeeData {
  fullName: string;
  cpf: string;
  role: string;
  status?: string;
  specialty?: string;
  crmNumber?: string;
  salary?: number;
  phone?: string;
  email?: string;
  hiredAt: string;
  workDays?: string[]; // Dias de trabalho: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  startHour?: string; // Hora de entrada: "08:00"
  endHour?: string; // Hora de saída: "18:00"
}

// Data for updating an existing employee (all fields optional except id)
export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  id: number;
}

// Raw employee data from Supabase database
export interface SupabaseEmployee {
  id: string;
  full_name: string;
  cpf: string;
  role: string;
  status: string;
  specialty: string | null;
  crm_number: string | null;
  salary: number | null;
  phone: string | null;
  email: string | null;
  hired_at: string;
  created_at: string;
  updated_at: string;
}

// Employee work schedule data from Supabase
export interface SupabaseEmployeeWorkSchedule {
  id: number;
  employee_id: number;
  weekday: number; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  start_time: string;
  end_time: string;
}

// Employee work schedule data for inserting
export interface SupabaseEmployeeWorkScheduleInsert {
  employee_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

// Data structure for updating employee in Supabase
export interface SupabaseEmployeeUpdate {
  full_name?: string;
  cpf?: string;
  role?: string;
  status?: string;
  specialty?: string | null;
  crm_number?: string | null;
  salary?: number | null;
  phone?: string | null;
  email?: string | null;
  hired_at?: string;
}

// Data structure for creating employee in Supabase
export interface SupabaseEmployeeInsert {
  full_name: string;
  cpf: string;
  role: string;
  status: string;
  specialty: string | null;
  crm_number: string | null;
  salary: number | null;
  phone: string | null;
  email: string | null;
  hired_at: string;
}

// Appointment interfaces based on database structure
export interface Appointment {
  id: number;
  employeeId: number;
  patientName: string;
  patientPhone: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface SupabaseAppointment {
  id: number;
  employee_id: number;
  patient_name: string;
  patient_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface CreateAppointmentData {
  employeeId: number;
  patientName: string;
  patientPhone?: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
  notes?: string;
}

export interface SupabaseAppointmentInsert {
  employee_id: number;
  patient_name: string;
  patient_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
}

// Filter options for employee queries
export interface EmployeeFilters {
  role?: string;
  specialty?: string;
  search?: string;
}

// Statistics about employees
export interface EmployeeStats {
  total: number;
  byRole: Record<string, number>;
  bySpecialty: Record<string, number>;
  recent: number; // employees added in last 30 days
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Employee roles enum for better type safety
export enum EmployeeRole {
  DENTIST = 'Dentista',
  ASSISTANT = 'Assistente',
  RECEPTIONIST = 'Recepcionista',
  MANAGER = 'Gerente',
  AUXILIARY = 'Auxiliar',
  HYGIENIST = 'Higienista',
  TECHNICIAN = 'Técnico em Prótese'
}

// Employee specialties enum
export enum EmployeeSpecialty {
  ORTHODONTICS = 'Ortodontia',
  ENDODONTICS = 'Endodontia',
  PERIODONTICS = 'Periodontia',
  ORAL_SURGERY = 'Cirurgia Oral',
  PEDIATRIC = 'Odontopediatria',
  PROSTHETICS = 'Prótese',
  IMPLANTOLOGY = 'Implantodontia',
  GENERAL = 'Clínica Geral'
}

// Days of the week enum
export enum DayOfWeek {
  SUNDAY = 'Dom',
  MONDAY = 'Seg',
  TUESDAY = 'Ter',
  WEDNESDAY = 'Qua',
  THURSDAY = 'Qui',
  FRIDAY = 'Sex',
  SATURDAY = 'Sáb'
}

// Mapping between day names and weekday numbers (matching database structure)
export const WEEKDAY_MAP: Record<string, number> = {
  'Dom': 0,
  'Seg': 1,
  'Ter': 2,
  'Qua': 3,
  'Qui': 4,
  'Sex': 5,
  'Sáb': 6
};

// Reverse mapping from weekday numbers to day names
export const REVERSE_WEEKDAY_MAP: Record<number, string> = {
  0: 'Dom',
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: 'Sáb'
};

// Employee status enum
export enum EmployeeStatus {
  ACTIVE = 'ativo',
  INACTIVE = 'inativo',
  SUSPENDED = 'suspenso'
}

// Appointment status enum
export enum AppointmentStatus {
  SCHEDULED = 'agendado',
  CONFIRMED = 'confirmado',
  IN_PROGRESS = 'em_andamento',
  COMPLETED = 'concluido',
  CANCELLED = 'cancelado',
  NO_SHOW = 'faltou'
}
