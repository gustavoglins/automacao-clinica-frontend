import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  SupabaseAppointment,
  SupabaseAppointmentInsert,
  SupabaseAppointmentUpdate,
  AppointmentFilters,
  AppointmentStats,
  ValidationResult,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS
} from '@/types/appointment';
import { AppointmentStatus } from '@/types/appointment';

// Re-export types for backward compatibility
export type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters,
  AppointmentStats,
  ValidationResult,
  AppointmentStatus
};

export { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS };

/**
 * Utility functions for data transformation
 */
class AppointmentTransformer {
  /**
   * Transform Supabase appointment data to app Appointment interface
   */
  static fromSupabase(supabaseAppointment: SupabaseAppointment): Appointment {
    return {
      id: supabaseAppointment.id,
      patientId: supabaseAppointment.patient_id,
      employeeId: supabaseAppointment.employee_id,
      serviceId: supabaseAppointment.service_id,
      appointmentAt: supabaseAppointment.appointment_at,
      appointmentEnd: supabaseAppointment.appointment_end,
      status: supabaseAppointment.status,
      createdAt: supabaseAppointment.created_at,
      updatedAt: supabaseAppointment.updated_at
    };
  }

  /**
   * Transform CreateAppointmentData to Supabase insert format
   */
  static toSupabaseInsert(appointmentData: CreateAppointmentData): SupabaseAppointmentInsert {
    return {
      patient_id: appointmentData.patientId,
      employee_id: appointmentData.employeeId,
      service_id: appointmentData.serviceId,
      appointment_at: appointmentData.appointmentAt,
      appointment_end: appointmentData.appointmentEnd,
      status: appointmentData.status || AppointmentStatus.AGENDADA
    };
  }

  /**
   * Transform UpdateAppointmentData to Supabase update format
   */
  static toSupabaseUpdate(appointmentData: UpdateAppointmentData): SupabaseAppointmentUpdate {
    const updateData: SupabaseAppointmentUpdate = {};

    // Only include fields that are provided
    if (appointmentData.patientId !== undefined) updateData.patient_id = appointmentData.patientId;
    if (appointmentData.employeeId !== undefined) updateData.employee_id = appointmentData.employeeId;
    if (appointmentData.serviceId !== undefined) updateData.service_id = appointmentData.serviceId;
    if (appointmentData.appointmentAt !== undefined) updateData.appointment_at = appointmentData.appointmentAt;
    if (appointmentData.appointmentEnd !== undefined) updateData.appointment_end = appointmentData.appointmentEnd;
    if (appointmentData.status !== undefined) updateData.status = appointmentData.status;

    return updateData;
  }
}

class AppointmentService {
  /**
   * Fetch all appointments from database with related data
   */
  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .order('appointment_at');

      if (error) throw error;

      return data.map(this.transformWithRelations);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Erro ao carregar agendamentos');
      throw error;
    }
  }

  /**
   * Get appointment by ID with related data
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return this.transformWithRelations(data);
    } catch (error) {
      console.error('Error fetching appointment by ID:', error);
      toast.error('Erro ao carregar agendamento');
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment> {
    try {
      const insertData = AppointmentTransformer.toSupabaseInsert(appointmentData);

      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .single();

      if (error) throw error;

      toast.success('Agendamento criado com sucesso!');

      return this.transformWithRelations(data);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Erro ao criar agendamento');
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  async updateAppointment(appointmentData: UpdateAppointmentData): Promise<Appointment> {
    try {
      const updateData = AppointmentTransformer.toSupabaseUpdate(appointmentData);

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentData.id)
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .single();

      if (error) throw error;

      toast.success('Agendamento atualizado com sucesso!');

      return this.transformWithRelations(data);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Erro ao atualizar agendamento');
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Agendamento removido com sucesso!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Erro ao remover agendamento');
      throw error;
    }
  }

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .gte('appointment_at', startOfDay.toISOString())
        .lte('appointment_at', endOfDay.toISOString())
        .order('appointment_at');

      if (error) throw error;

      return data.map(this.transformWithRelations);
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      toast.error('Erro ao carregar agendamentos da data');
      throw error;
    }
  }

  /**
   * Get appointments for a specific employee
   */
  async getAppointmentsByEmployee(employeeId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .eq('employee_id', employeeId)
        .order('appointment_at');

      if (error) throw error;

      return data.map(this.transformWithRelations);
    } catch (error) {
      console.error('Error fetching appointments by employee:', error);
      toast.error('Erro ao carregar agendamentos do funcionário');
      throw error;
    }
  }

  /**
   * Search appointments by term
   */
  async searchAppointments(searchTerm: string): Promise<Appointment[]> {
    try {
      if (!searchTerm.trim()) {
        return this.getAllAppointments();
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `)
        .or(`patient.full_name.ilike.%${searchTerm}%,employee.full_name.ilike.%${searchTerm}%,service.name.ilike.%${searchTerm}%`)
        .order('appointment_at');

      if (error) throw error;

      return data.map(this.transformWithRelations);
    } catch (error) {
      console.error('Error searching appointments:', error);
      toast.error('Erro ao buscar agendamentos');
      throw error;
    }
  }

  /**
   * Filter appointments by various criteria
   */
  async filterAppointments(filters: AppointmentFilters): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, phone, email),
          employee:employees(full_name, role),
          service:services(name, duration_minutes, price)
        `);

      // Apply search filter
      if (filters.search) {
        query = query.or(`patient.full_name.ilike.%${filters.search}%,employee.full_name.ilike.%${filters.search}%,service.name.ilike.%${filters.search}%`);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply employee filter
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      // Apply service filter
      if (filters.serviceId) {
        query = query.eq('service_id', filters.serviceId);
      }

      // Apply date range filter
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          query = query.gte('appointment_at', filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          query = query.lte('appointment_at', filters.dateRange.end);
        }
      }

      const { data, error } = await query.order('appointment_at');

      if (error) throw error;

      return data.map(this.transformWithRelations);
    } catch (error) {
      console.error('Error filtering appointments:', error);
      toast.error('Erro ao filtrar agendamentos');
      throw error;
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(): Promise<AppointmentStats> {
    try {
      // Get total appointments
      const { count: total, error: totalError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', today.toISOString())
        .lt('appointment_at', tomorrow.toISOString());

      if (todayError) throw todayError;

      // Get this week's appointments
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const { count: thisWeek, error: weekError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', startOfWeek.toISOString())
        .lt('appointment_at', endOfWeek.toISOString());

      if (weekError) throw weekError;

      // Get this month's appointments
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const { count: thisMonth, error: monthError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', startOfMonth.toISOString())
        .lte('appointment_at', endOfMonth.toISOString());

      if (monthError) throw monthError;

      // Get appointments by status
      const { data: statusData, error: statusError } = await supabase
        .from('appointments')
        .select('status');

      if (statusError) throw statusError;

      const byStatus: Record<string, number> = {};
      statusData?.forEach(appointment => {
        byStatus[appointment.status] = (byStatus[appointment.status] || 0) + 1;
      });

      // Get appointments by employee
      const { data: employeeData, error: employeeError } = await supabase
        .from('appointments')
        .select('employee_id');

      if (employeeError) throw employeeError;

      const byEmployee: Record<string, number> = {};
      employeeData?.forEach(appointment => {
        byEmployee[appointment.employee_id] = (byEmployee[appointment.employee_id] || 0) + 1;
      });

      return {
        total: total || 0,
        today: todayCount || 0,
        thisWeek: thisWeek || 0,
        thisMonth: thisMonth || 0,
        byStatus,
        byEmployee
      };
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      toast.error('Erro ao carregar estatísticas');
      throw error;
    }
  }

  /**
   * Transform appointment data with relations
   */
  private transformWithRelations(data: {
    id: string;
    patient_id: string;
    employee_id: string;
    service_id: number;
    appointment_at: string;
    appointment_end: string;
    status: string;
    created_at: string;
    updated_at: string;
    patient?: {
      full_name: string;
      phone: string | null;
      email: string | null;
    };
    employee?: {
      full_name: string;
      role: string;
    };
    service?: {
      name: string;
      duration_minutes: number;
      price: number;
    };
  }): Appointment {
    const appointment = AppointmentTransformer.fromSupabase(data);

    // Add related data if available
    if (data.patient) {
      appointment.patient = {
        fullName: data.patient.full_name,
        phone: data.patient.phone,
        email: data.patient.email
      };
    }

    if (data.employee) {
      appointment.employee = {
        fullName: data.employee.full_name,
        role: data.employee.role
      };
    }

    if (data.service) {
      appointment.service = {
        name: data.service.name,
        durationMinutes: data.service.duration_minutes,
        price: data.service.price
      };
    }

    return appointment;
  }

  /**
   * Validate appointment data
   */
  validateAppointmentData(data: CreateAppointmentData | UpdateAppointmentData): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!data.patientId?.trim()) {
      errors.push('Paciente é obrigatório');
    }

    if (!data.employeeId?.trim()) {
      errors.push('Funcionário é obrigatório');
    }

    if (!data.serviceId) {
      errors.push('Serviço é obrigatório');
    }

    if (!data.appointmentAt) {
      errors.push('Data e hora do agendamento são obrigatórios');
    } else {
      const appointmentDate = new Date(data.appointmentAt);
      const now = new Date();
      if (appointmentDate < now) {
        errors.push('Data do agendamento não pode ser no passado');
      }
    }

    if (!data.appointmentEnd) {
      errors.push('Data e hora de término são obrigatórios');
    } else if (data.appointmentAt && data.appointmentEnd) {
      const start = new Date(data.appointmentAt);
      const end = new Date(data.appointmentEnd);
      if (end <= start) {
        errors.push('Data de término deve ser posterior à data de início');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService(); 