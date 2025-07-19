import { supabase } from '@/lib/supabaseClient';

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
  monthlyRevenue: number;
  attendanceRate: number;
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
  patientName: string;
  serviceName: string;
  employeeName: string;
  status: string;
  durationMinutes: number;
  timeUntil: string; // "em 2 horas", "em 30 minutos", "amanhã às 10:00", etc.
}

export const dashboardService = {
  // Buscar estatísticas gerais do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Consultas de hoje
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', today.toISOString())
        .lt('appointment_at', tomorrow.toISOString());

      // Total de pacientes
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Receita mensal (soma dos pagamentos do mês)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount_paid')
        .gte('paid_at', startOfMonth.toISOString())
        .lte('paid_at', endOfMonth.toISOString())
        .eq('status', 'pago');

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0;

      // Taxa de comparecimento (consultas realizadas vs agendadas no mês)
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', startOfMonth.toISOString())
        .lte('appointment_at', endOfMonth.toISOString());

      const { count: completedAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_at', startOfMonth.toISOString())
        .lte('appointment_at', endOfMonth.toISOString())
        .eq('status', 'realizada');

      const attendanceRate = totalAppointments ? Math.round((completedAppointments || 0) / totalAppointments * 100) : 0;

      return {
        todayAppointments: todayAppointments || 0,
        totalPatients: totalPatients || 0,
        monthlyRevenue,
        attendanceRate
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return {
        todayAppointments: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        attendanceRate: 0
      };
    }
  },

  // Buscar consultas de hoje
  async getTodayAppointments(): Promise<TodayAppointment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_at,
          status,
          patients(full_name),
          services(name, duration_minutes),
          employees(full_name)
        `)
        .gte('appointment_at', today.toISOString())
        .lt('appointment_at', tomorrow.toISOString())
        .order('appointment_at', { ascending: true });

      if (error) throw error;

      return data?.map(appointment => ({
        id: appointment.id,
        appointmentAt: appointment.appointment_at,
        patientName: appointment.patients?.[0]?.full_name || 'Paciente não encontrado',
        serviceName: appointment.services?.[0]?.name || 'Serviço não encontrado',
        employeeName: appointment.employees?.[0]?.full_name || 'Funcionário não encontrado',
        status: appointment.status,
        durationMinutes: appointment.services?.[0]?.duration_minutes || 30
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar consultas de hoje:', error);
      return [];
    }
  },

  // Buscar próxima consulta
  async getNextAppointment(): Promise<NextAppointment | null> {
    try {
      const now = new Date();

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_at,
          status,
          patients(full_name),
          services(name, duration_minutes),
          employees(full_name)
        `)
        .gte('appointment_at', now.toISOString())
        .order('appointment_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return null;
      }

      const appointment = data[0];
      const appointmentDate = new Date(appointment.appointment_at);
      const timeDiff = appointmentDate.getTime() - now.getTime();

      // Calcular tempo até a consulta
      const timeUntil = this.calculateTimeUntil(timeDiff);

      return {
        id: appointment.id,
        appointmentAt: appointment.appointment_at,
        patientName: appointment.patients?.[0]?.full_name || 'Paciente não encontrado',
        serviceName: appointment.services?.[0]?.name || 'Serviço não encontrado',
        employeeName: appointment.employees?.[0]?.full_name || 'Funcionário não encontrado',
        status: appointment.status,
        durationMinutes: appointment.services?.[0]?.duration_minutes || 30,
        timeUntil
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
  }
}; 