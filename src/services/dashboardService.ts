import { supabase } from '@/lib/supabaseClient';

export interface DashboardStats {
  todayAppointments: number;
  totalPatients: number;
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
  patientName: string;
  patientAge?: number;
  patientEmail?: string;
  patientPhone?: string;
  serviceName: string;
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

      // Total de consultas agendadas (todas)
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

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
        attendanceRate,
        totalAppointments: totalAppointments || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      return {
        todayAppointments: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        attendanceRate: 0,
        totalAppointments: 0
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
          patient_id,
          service_id,
          employee_id,
          patients(full_name),
          services(name, duration_minutes),
          employees(full_name)
        `)
        .gte('appointment_at', today.toISOString())
        .lt('appointment_at', tomorrow.toISOString())
        .order('appointment_at', { ascending: true });

      if (error) throw error;

      const results: TodayAppointment[] = [];
      for (const appointment of data || []) {
        // Paciente
        let patientName = appointment.patients?.[0]?.full_name;
        if (!patientName && appointment.patient_id) {
          const { data: patientData } = await supabase
            .from('patients')
            .select('full_name')
            .eq('id', appointment.patient_id)
            .single();
          if (patientData && patientData.full_name) patientName = patientData.full_name;
        }
        if (!patientName) patientName = 'Paciente não encontrado';

        // Serviço
        let serviceName = appointment.services?.[0]?.name;
        let durationMinutes = appointment.services?.[0]?.duration_minutes;
        if ((!serviceName || !durationMinutes) && appointment.service_id) {
          const { data: serviceData } = await supabase
            .from('services')
            .select('name, duration_minutes')
            .eq('id', appointment.service_id)
            .single();
          if (serviceData) {
            if (!serviceName && serviceData.name) serviceName = serviceData.name;
            if (!durationMinutes && serviceData.duration_minutes) durationMinutes = serviceData.duration_minutes;
          }
        }
        if (!serviceName) serviceName = 'Serviço não encontrado';
        if (!durationMinutes) durationMinutes = 30;

        // Funcionário
        let employeeName = appointment.employees?.[0]?.full_name;
        if (!employeeName && appointment.employee_id) {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('full_name')
            .eq('id', appointment.employee_id)
            .single();
          if (employeeData && employeeData.full_name) employeeName = employeeData.full_name;
        }
        if (!employeeName) employeeName = 'Funcionário não encontrado';

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
        .select(`
          id,
          appointment_at,
          status,
          patient_id,
          employee_id,
          patients(full_name),
          services(name, duration_minutes),
          employees(full_name),
          service_id
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

      // Buscar paciente pelo id
      let patientName = 'Paciente não encontrado';
      let patientAge: number | undefined = undefined;
      let patientEmail: string | undefined = undefined;
      let patientPhone: string | undefined = undefined;
      if (appointment.patient_id) {
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
          if (patientData.email) patientEmail = patientData.email;
          if (patientData.phone) patientPhone = patientData.phone;
        }
      }

      // Buscar funcionário pelo id
      let employeeName = 'Funcionário não encontrado';
      if (appointment.employee_id) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('full_name')
          .eq('id', appointment.employee_id)
          .single();
        if (employeeData && employeeData.full_name) employeeName = employeeData.full_name;
      }

      // Buscar serviço pelo id
      let serviceName = 'Serviço não encontrado';
      let durationMinutes = 30;
      if (appointment.service_id) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('name, duration_minutes')
          .eq('id', appointment.service_id)
          .single();
        if (serviceData && serviceData.name) serviceName = serviceData.name;
        if (serviceData && serviceData.duration_minutes) durationMinutes = serviceData.duration_minutes;
      }

      // Calcular tempo até a consulta
      const timeUntil = this.calculateTimeUntil(timeDiff);

      // Format the appointment date for display (e.g., "dd/MM/yyyy HH:mm")
      const formattedDate = appointmentDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        id: appointment.id,
        appointmentAt: appointment.appointment_at,
        patientName,
        patientAge,
        patientEmail,
        patientPhone,
        serviceName,
        employeeName,
        status: appointment.status,
        durationMinutes,
        timeUntil,
        formattedDate
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