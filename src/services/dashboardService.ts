// Backend-only dashboard service (Supabase removido)
import { appointmentService } from './appointmentService';
import { patientService } from './patientService';
import { serviceService } from './servicesService';
import { AppointmentStatus } from '@/types/appointment';
import { apiGet } from '@/lib/apiClient';

// Flag opcional para tentar endpoint de pagamentos. Evita 404 desnecessário.
const ENABLE_PAYMENTS_ENDPOINT =
  import.meta.env.VITE_ENABLE_PAYMENTS_ENDPOINT === 'true';

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  activePatients: number;
  monthlyRevenue: number;
  attendanceRate: number;
  totalAppointments: number;
}

export interface TodayAppointment {
  id: string;
  appointmentAt: string;
  patientName: string;
  serviceName: string;
  employeeName: string;
  status: string;
  durationMinutes: number;
}

export interface NextAppointment {
  id: string;
  appointmentAt: string;
  patientId?: string;
  patientName: string;
  patientAge?: number;
  patientEmail?: string;
  patientPhone?: string;
  employeeId?: string;
  serviceName: string;
  serviceId?: number;
  employeeName: string;
  status: string;
  durationMinutes: number;
  timeUntil: string; // "em 2 horas", "em 30 minutos", "amanhã às 10:00", etc.
  formattedDate: string; // data formatada para exibição
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);
      const appointments = await appointmentService.getAllAppointments(true);
      const patients = await patientService.getAllPatients();
      const todayAppointments = appointments.filter(
        (a) => a.date === todayStr
      ).length;
      const totalPatients = patients.length;
      const activePatients = totalPatients; // sem status ativo distinto no frontend
      // Receita mensal: somatório dos serviços realizados no mês (status realizada)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      interface ApptLite {
        service?: { price?: number };
        appointmentAt?: string;
        status: string;
      }
      const monthlyRevenue = (appointments as ApptLite[])
        .filter((a) => a.status === 'realizada')
        .filter((a) => {
          if (!a.appointmentAt) return false;
          const d = new Date(a.appointmentAt);
          return d >= startOfMonth && d < endOfMonth;
        })
        .reduce((sum, a) => sum + (a.service?.price || 0), 0);
      const totalAppointments = appointments.length;
      const completedThisMonth = appointments.filter(
        (a) =>
          a.status === 'realizada' &&
          a.date &&
          a.date >= startOfMonth.toISOString().slice(0, 10) &&
          a.date < endOfMonth.toISOString().slice(0, 10)
      ).length;
      const attendanceRate = totalAppointments
        ? Math.round((completedThisMonth / totalAppointments) * 100)
        : 0;
      // Tentar sobrescrever receita com endpoint /api/payments se existir
      let finalMonthlyRevenue = monthlyRevenue;
      if (ENABLE_PAYMENTS_ENDPOINT) {
        try {
          const ym = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, '0')}`;
          // hipotético endpoint /api/payments?month=YYYY-MM
          const payments = await apiGet<{ amount_paid: number }[]>(
            `/api/payments?month=${ym}`
          );
          finalMonthlyRevenue = payments.reduce(
            (s, p) => s + (p.amount_paid || 0),
            0
          );
        } catch (_e) {
          /* fallback mantido */
        }
      }
      return {
        todayAppointments,
        totalPatients,
        activePatients,
        monthlyRevenue: finalMonthlyRevenue,
        attendanceRate,
        totalAppointments,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return {
        todayAppointments: 0,
        totalPatients: 0,
        activePatients: 0,
        monthlyRevenue: 0,
        attendanceRate: 0,
        totalAppointments: 0,
      };
    }
  },
  async getTodayAppointments(): Promise<TodayAppointment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);
      const appointments = await appointmentService.getAllAppointments(true);
      return appointments
        .filter((a) => a.date === todayStr)
        .sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt))
        .map((a) => ({
          id: a.id,
          appointmentAt: a.appointmentAt,
          patientName: a.patient?.fullName || 'Paciente não encontrado',
          serviceName: a.service?.name || 'Serviço não encontrado',
          employeeName: a.employee?.fullName || 'Funcionário não encontrado',
          status: a.status,
          durationMinutes: a.service?.durationMinutes || 30,
        }));
    } catch (error) {
      console.error('Erro ao buscar consultas de hoje:', error);
      return [];
    }
  },
  async getNextAppointment(): Promise<NextAppointment | null> {
    try {
      const now = new Date();
      const statuses = new Set([
        AppointmentStatus.AGENDADA,
        'confirmada',
        'reagendada',
        'em_andamento',
      ]);
      const appointments = await appointmentService.getAllAppointments(true);
      const upcoming = appointments
        .filter(
          (a) =>
            a.appointmentAt &&
            new Date(a.appointmentAt) >= now &&
            statuses.has(a.status)
        )
        .sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt));
      if (!upcoming.length) return null;
      const appt = upcoming[0];
      // Buscar informações adicionais do paciente (idade) se necessário
      let patientAge: number | undefined;
      let patientEmail: string | undefined;
      let patientPhone: string | undefined;
      let patientName = appt.patient?.fullName || 'Paciente não encontrado';
      if (appt.patientId) {
        try {
          const p = await patientService.getPatientById(appt.patientId);
          if (p) {
            patientName = p.fullName;
            patientEmail = p.email || undefined;
            patientPhone = p.phone || undefined;
            if (p.birthDate) {
              const bd = new Date(p.birthDate);
              const today = new Date();
              let age = today.getFullYear() - bd.getFullYear();
              const m = today.getMonth() - bd.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
              patientAge = age;
            }
          }
        } catch (_e) {
          /* ignore */
        }
      }
      const serviceName = appt.service?.name || 'Serviço não encontrado';
      const durationMinutes = appt.service?.durationMinutes || 30;
      const employeeName =
        appt.employee?.fullName || 'Funcionário não encontrado';
      const appointmentDate = new Date(appt.appointmentAt);
      const timeDiff = appointmentDate.getTime() - now.getTime();
      const timeUntil = this.calculateTimeUntil(timeDiff);
      const formattedDate = appointmentDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        id: appt.id,
        appointmentAt: appt.appointmentAt,
        patientId: appt.patientId,
        patientName,
        patientAge,
        patientEmail,
        patientPhone,
        employeeId: appt.employeeId,
        serviceName,
        serviceId: appt.serviceId as number | undefined,
        employeeName,
        status: appt.status,
        durationMinutes,
        timeUntil,
        formattedDate,
      };
    } catch (error) {
      console.error('Erro ao buscar próxima consulta:', error);
      return null;
    }
  },

  // Função auxiliar para calcular tempo até a consulta
  calculateTimeUntil(timeDiff: number): string {
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      if (days === 1) {
        return 'amanhã';
      } else if (days < 7) {
        return `em ${days} dias`;
      } else {
        const weeks = Math.floor(days / 7);
        return `em ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
      }
    } else if (hours > 0) {
      return `em ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (minutes > 0) {
      return `em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return 'agora';
    }
  },
};
