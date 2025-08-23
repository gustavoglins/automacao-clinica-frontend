// Backend-only appointment service (remove Supabase direto)
import { toast } from 'sonner';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
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
  APPOINTMENT_STATUS_COLORS,
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
  AppointmentStatus,
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
      date: supabaseAppointment.date,
      status: supabaseAppointment.status,
      createdAt: supabaseAppointment.created_at,
      updatedAt: supabaseAppointment.updated_at,
    };
  }

  /**
   * Transform CreateAppointmentData to Supabase insert format
   */
  static toSupabaseInsert(
    appointmentData: CreateAppointmentData
  ): SupabaseAppointmentInsert {
    // Deriva o campo date (YYYY-MM-DD) a partir do appointmentAt caso não venha informado
    const toLocalDateString = (iso: string) => {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return {
      patient_id: appointmentData.patientId,
      employee_id: appointmentData.employeeId,
      service_id: appointmentData.serviceId,
      appointment_at: appointmentData.appointmentAt,
      appointment_end: appointmentData.appointmentEnd,
      date:
        appointmentData.date ||
        toLocalDateString(appointmentData.appointmentAt),
      status: appointmentData.status || AppointmentStatus.AGENDADA,
    };
  }

  /**
   * Transform UpdateAppointmentData to Supabase update format
   */
  static toSupabaseUpdate(
    appointmentData: UpdateAppointmentData
  ): SupabaseAppointmentUpdate {
    const updateData: SupabaseAppointmentUpdate = {};

    // Only include fields that are provided
    if (appointmentData.patientId !== undefined)
      updateData.patient_id = appointmentData.patientId;
    if (appointmentData.employeeId !== undefined)
      updateData.employee_id = appointmentData.employeeId;
    if (appointmentData.serviceId !== undefined)
      updateData.service_id = appointmentData.serviceId;
    if (appointmentData.appointmentAt !== undefined)
      updateData.appointment_at = appointmentData.appointmentAt;
    if (appointmentData.appointmentEnd !== undefined)
      updateData.appointment_end = appointmentData.appointmentEnd;
    // Se for enviado appointmentAt sem date, mantemos a consistência derivando a data
    if (appointmentData.date !== undefined) {
      updateData.date = appointmentData.date;
    } else if (appointmentData.appointmentAt !== undefined) {
      const d = new Date(appointmentData.appointmentAt);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      updateData.date = `${y}-${m}-${day}`;
    }
    if (appointmentData.status !== undefined)
      updateData.status = appointmentData.status;

    return updateData;
  }
}

class AppointmentService {
  // Cache simples para evitar múltiplas chamadas durante uma sessão curta
  private _cacheTimestamp: number = 0;
  private _cache: Appointment[] = [];
  private cacheTTL = 15_000; // 15s

  private async enrichAppointments(
    rows: SupabaseAppointment[]
  ): Promise<Appointment[]> {
    // Tipos mínimos para enriquecer relacionamentos
    interface PatientRow {
      id: string;
      full_name: string;
      phone: string | null;
      email: string | null;
    }
    interface EmployeeRow {
      id: string;
      full_name: string;
      role: string;
    }
    interface ServiceRow {
      id: number;
      name: string;
      duration_minutes: number;
      price: number;
    }
    const [patients, employees, services] = await Promise.all([
      apiGet<PatientRow[]>('/api/patients').catch(() => []),
      apiGet<EmployeeRow[]>('/api/employees').catch(() => []),
      apiGet<ServiceRow[]>('/api/services').catch(() => []),
    ]);
    const patientMap = new Map<
      string,
      { fullName: string; phone: string | null; email: string | null }
    >(
      patients.map(
        (
          p
        ): [
          string,
          { fullName: string; phone: string | null; email: string | null }
        ] => [p.id, { fullName: p.full_name, phone: p.phone, email: p.email }]
      )
    );
    const employeeMap = new Map<string, { fullName: string; role: string }>(
      employees.map((e): [string, { fullName: string; role: string }] => [
        e.id,
        { fullName: e.full_name, role: e.role },
      ])
    );
    const serviceMap = new Map<
      number,
      { name: string; durationMinutes: number; price: number }
    >(
      services.map(
        (
          s
        ): [
          number,
          { name: string; durationMinutes: number; price: number }
        ] => [
          s.id,
          { name: s.name, durationMinutes: s.duration_minutes, price: s.price },
        ]
      )
    );
    return rows.map((r) => {
      const base = AppointmentTransformer.fromSupabase(r);
      const p = patientMap.get(r.patient_id);
      if (p)
        base.patient = { fullName: p.fullName, phone: p.phone, email: p.email };
      const em = employeeMap.get(r.employee_id);
      if (em) base.employee = { fullName: em.fullName, role: em.role };
      const sv = serviceMap.get(r.service_id);
      if (sv)
        base.service = {
          name: sv.name,
          durationMinutes: sv.durationMinutes,
          price: sv.price,
        };
      return base;
    });
  }

  async getAllAppointments(force = false): Promise<Appointment[]> {
    const now = Date.now();
    if (
      !force &&
      this._cache.length &&
      now - this._cacheTimestamp < this.cacheTTL
    ) {
      return this._cache;
    }
    try {
      const rows = await apiGet<SupabaseAppointment[]>('/api/appointments');
      const enriched = await this.enrichAppointments(rows);
      this._cache = enriched;
      this._cacheTimestamp = now;
      return enriched;
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
      throw error;
    }
  }

  /**
   * Get appointment by ID with related data
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const row = await apiGet<SupabaseAppointment>(`/api/appointments/${id}`);
      const [appt] = await this.enrichAppointments([row]);
      return appt || null;
    } catch (error) {
      console.error('Erro ao carregar agendamento:', error);
      toast.error('Erro ao carregar agendamento');
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const payload = AppointmentTransformer.toSupabaseInsert(data);
      const created = await apiPost<SupabaseAppointment>(
        '/api/appointments',
        payload
      );
      // Backend já cuida de times_used
      const [appt] = await this.enrichAppointments([created]);
      this._cacheTimestamp = 0; // invalida cache
      toast.success('Agendamento criado');
      window.dispatchEvent(
        new CustomEvent('appointments:changed', {
          detail: { type: 'create', id: appt.id },
        })
      );
      return appt;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  async updateAppointment(data: UpdateAppointmentData): Promise<Appointment> {
    try {
      const payload = AppointmentTransformer.toSupabaseUpdate(data);
      const updated = await apiPut<SupabaseAppointment>(
        `/api/appointments/${data.id}`,
        {
          // Para atualização completa mantendo compatibilidade com backend (usa PUT)
          patient_id: payload.patient_id ?? data.patientId,
          employee_id: payload.employee_id ?? data.employeeId,
          service_id: payload.service_id ?? data.serviceId,
          appointment_at: payload.appointment_at ?? data.appointmentAt!,
          appointment_end: payload.appointment_end ?? data.appointmentEnd!,
          date: payload.date ?? data.date,
          status: payload.status ?? data.status,
        }
      );
      const [appt] = await this.enrichAppointments([updated]);
      this._cacheTimestamp = 0;
      toast.success('Agendamento atualizado');
      window.dispatchEvent(
        new CustomEvent('appointments:changed', {
          detail: { type: 'update', id: appt.id },
        })
      );
      return appt;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    try {
      await apiDelete(`/api/appointments/${id}`);
      this._cacheTimestamp = 0;
      toast.success('Agendamento removido');
      window.dispatchEvent(
        new CustomEvent('appointments:changed', {
          detail: { type: 'delete', id },
        })
      );
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      toast.error('Erro ao remover agendamento');
      throw error;
    }
  }

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const all = await this.getAllAppointments();
    return all.filter((a) => a.date === date);
  }

  /**
   * Get appointments for a specific employee
   */
  async getAppointmentsByEmployee(employeeId: string): Promise<Appointment[]> {
    const all = await this.getAllAppointments();
    return all.filter((a) => a.employeeId === employeeId);
  }

  /**
   * Get the next upcoming appointment for a given patient
   */
  async getNextAppointmentForPatient(
    patientId: string
  ): Promise<Appointment | null> {
    const all = await this.getAllAppointments();
    const now = new Date();
    const upcoming = all
      .filter(
        (a) =>
          a.patientId === patientId &&
          new Date(a.appointmentAt) >= now &&
          [
            AppointmentStatus.AGENDADA,
            AppointmentStatus.CONFIRMADA,
            AppointmentStatus.REAGENDADA,
            AppointmentStatus.EM_ANDAMENTO,
          ].includes(a.status as AppointmentStatus)
      )
      .sort(
        (a, b) =>
          new Date(a.appointmentAt).getTime() -
          new Date(b.appointmentAt).getTime()
      );
    return upcoming[0] || null;
  }

  /**
   * Search appointments by term
   */
  async searchAppointments(searchTerm: string): Promise<Appointment[]> {
    const term = searchTerm.trim().toLowerCase();
    const all = await this.getAllAppointments();
    if (!term) return all;
    return all.filter((a) =>
      [
        a.patient?.fullName || '',
        a.employee?.fullName || '',
        a.service?.name || '',
      ]
        .map((t) => t.toLowerCase())
        .some((f) => f.includes(term))
    );
  }

  /**
   * Filter appointments by various criteria
   */
  async filterAppointments(
    filters: AppointmentFilters
  ): Promise<Appointment[]> {
    const all = await this.getAllAppointments();
    return all.filter((a) => {
      if (filters.search && filters.search.trim() !== '') {
        const t = filters.search.toLowerCase();
        if (
          ![
            a.patient?.fullName || '',
            a.employee?.fullName || '',
            a.service?.name || '',
          ]
            .map((f) => f.toLowerCase())
            .some((f) => f.includes(t))
        )
          return false;
      }
      if (
        filters.status &&
        filters.status !== 'all' &&
        a.status !== filters.status
      )
        return false;
      if (filters.employeeId && a.employeeId !== filters.employeeId)
        return false;
      if (filters.serviceId && a.serviceId !== filters.serviceId) return false;
      if (filters.dateRange) {
        if (
          filters.dateRange.start &&
          a.date < filters.dateRange.start.slice(0, 10)
        )
          return false;
        if (
          filters.dateRange.end &&
          a.date > filters.dateRange.end.slice(0, 10)
        )
          return false;
      }
      return true;
    });
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(): Promise<AppointmentStats> {
    const all = await this.getAllAppointments();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const byStatus: Record<string, number> = {};
    const byEmployee: Record<string, number> = {};
    for (const a of all) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      byEmployee[a.employeeId] = (byEmployee[a.employeeId] || 0) + 1;
    }
    return {
      total: all.length,
      today: all.filter((a) => a.date === todayStr).length,
      thisWeek: all.filter((a) => {
        const d = new Date(a.date + 'T00:00:00');
        return d >= startOfWeek && d < endOfWeek;
      }).length,
      thisMonth: all.filter((a) => {
        const d = new Date(a.date + 'T00:00:00');
        return d >= startOfMonth && d <= endOfMonth;
      }).length,
      byStatus,
      byEmployee,
    };
  }

  // (transformWithRelations removido – enriquecimento feito em enrichAppointments)

  /**
   * Validate appointment data
   */
  validateAppointmentData(
    data: CreateAppointmentData | UpdateAppointmentData
  ): ValidationResult {
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
      errors,
    };
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();
