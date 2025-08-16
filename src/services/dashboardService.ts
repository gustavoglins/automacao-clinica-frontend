import { supabase } from '@/lib/supabaseClient';

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
  // Buscar estatísticas gerais do dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);

      // Consultas de hoje (usar coluna date para evitar problemas de fuso)
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', todayStr);

      // Total de pacientes
      const { count: totalPatients } = await supabase
        .from('patients_with_status')
        .select('*', { count: 'exact', head: true });

      // Pacientes ativos (usando a nova view)
      const { count: activePatients } = await supabase
        .from('patients_with_status')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      // Receita mensal (soma dos pagamentos do mês)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      let monthlyPayments: { amount_paid: number | null }[] | null = null;
      try {
        const {
          data,
          error: paymentsError,
          status,
        } = await supabase
          .from('payments')
          .select('amount_paid')
          .gte('paid_at', startOfMonth.toISOString())
          .lte('paid_at', endOfMonth.toISOString())
          .eq('status', 'pago');
        if (paymentsError) {
          // Ignora erro se tabela não existir (404 / undefined_table) ou permissão negada
          const pgError = paymentsError as { code?: string } | null;
          if (status === 404 || pgError?.code === '42P01') {
            console.warn(
              'Tabela payments inexistente. Considerando receita 0.'
            );
          } else {
            console.warn(
              'Erro ao buscar payments, usando receita 0:',
              paymentsError
            );
          }
        } else {
          monthlyPayments = data;
        }
      } catch (paymentsUnexpected) {
        console.warn(
          'Falha inesperada ao consultar payments:',
          paymentsUnexpected
        );
      }

      const monthlyRevenue =
        monthlyPayments?.reduce(
          (sum, payment) => sum + (payment.amount_paid || 0),
          0
        ) || 0;

      // Total de consultas agendadas (todas)
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      const { count: completedAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfMonth.toISOString().slice(0, 10))
        .lte('date', endOfMonth.toISOString().slice(0, 10))
        .eq('status', 'realizada');

      const attendanceRate = totalAppointments
        ? Math.round(((completedAppointments || 0) / totalAppointments) * 100)
        : 0;

      return {
        todayAppointments: todayAppointments || 0,
        totalPatients: totalPatients || 0,
        activePatients: activePatients || 0,
        monthlyRevenue,
        attendanceRate,
        totalAppointments: totalAppointments || 0,
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

  // Buscar consultas de hoje
  async getTodayAppointments(): Promise<TodayAppointment[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          appointment_at,
          status,
          patient_id,
          service_id,
          employee_id,
          patients(full_name),
          services(name, duration_minutes),
          employees(full_name)
        `
        )
        .eq('date', todayStr)
        .order('appointment_at', { ascending: true });

      if (error) throw error;

      const results: TodayAppointment[] = [];
      for (const appointment of data || []) {
        const patientName =
          appointment.patients?.[0]?.full_name || 'Paciente não encontrado';
        const serviceName =
          appointment.services?.[0]?.name || 'Serviço não encontrado';
        const durationMinutes =
          appointment.services?.[0]?.duration_minutes || 30;
        const employeeName =
          appointment.employees?.[0]?.full_name || 'Funcionário não encontrado';

        results.push({
          id: appointment.id,
          appointmentAt: appointment.appointment_at,
          patientName,
          serviceName,
          employeeName,
          status: appointment.status,
          durationMinutes,
        });
      }
      return results;
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
        .select(
          `
          id,
          appointment_at,
          status,
          patient_id,
          employee_id,
          patients(full_name, birth_date, email, phone),
          services(name, duration_minutes),
          employees(full_name),
          service_id
        `
        )
        .gte('appointment_at', now.toISOString())
        .in('status', ['agendada', 'confirmada', 'reagendada', 'em_andamento'])
        .order('appointment_at', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return null;
      }

      const appointment = data[0];
      const appointmentDate = new Date(appointment.appointment_at);
      const timeDiff = appointmentDate.getTime() - now.getTime();

      // Buscar paciente pelo id/relacionamento
      let patientName = 'Paciente não encontrado';
      let patientAge: number | undefined = undefined;
      let patientEmail: string | undefined = undefined;
      let patientPhone: string | undefined = undefined;
      if (appointment.patients?.[0]) {
        const p = appointment.patients[0];
        if (p.full_name) patientName = p.full_name;
        if (p.birth_date) {
          const birthDate = new Date(p.birth_date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          patientAge = age;
        }
        if (p.email) patientEmail = p.email;
        if (p.phone) patientPhone = p.phone;
      } else if (appointment.patient_id) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('full_name, birth_date, email, phone')
          .eq('id', appointment.patient_id)
          .single();
        if (patientData) {
          if (patientData.full_name) patientName = patientData.full_name;
          if (patientData.birth_date) {
            const birthDate = new Date(patientData.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            patientAge = age;
          }
          patientEmail = patientData.email || undefined;
          patientPhone = patientData.phone || undefined;
        }
      }

      // Funcionário
      let employeeName = 'Funcionário não encontrado';
      if (appointment.employees?.[0]?.full_name) {
        employeeName = appointment.employees[0].full_name;
      } else if (appointment.employee_id) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('full_name')
          .eq('id', appointment.employee_id)
          .single();
        if (employeeData?.full_name) employeeName = employeeData.full_name;
      }

      // Serviço
      let serviceName = 'Serviço não encontrado';
      let durationMinutes = 30;
      if (appointment.services?.[0]) {
        const s = appointment.services[0];
        if (s.name) serviceName = s.name;
        if (s.duration_minutes) durationMinutes = s.duration_minutes;
      } else if (appointment.service_id) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('name, duration_minutes')
          .eq('id', appointment.service_id)
          .single();
        if (serviceData?.name) serviceName = serviceData.name;
        if (serviceData?.duration_minutes)
          durationMinutes = serviceData.duration_minutes;
      }

      // Calcular tempo até a consulta
      const timeUntil = this.calculateTimeUntil(timeDiff);

      // Format the appointment date for display (e.g., "dd/MM/yyyy HH:mm")
      const formattedDate = appointmentDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: appointment.id,
        appointmentAt: appointment.appointment_at,
        patientId: appointment.patient_id,
        patientName,
        patientAge,
        patientEmail,
        patientPhone,
        employeeId: appointment.employee_id,
        serviceName,
        serviceId: appointment.service_id,
        employeeName,
        status: appointment.status,
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
