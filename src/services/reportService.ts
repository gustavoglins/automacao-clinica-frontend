// Backend-only reports service (removed direct Supabase queries)
import { apiGet } from '@/lib/apiClient';
import { appointmentService } from './appointmentService';
import { patientService } from './patientService';
// services data not directly needed for current local aggregations; import can be added if required later

export interface ClinicProductionReport {
  totalAppointments: number;
  totalRevenue: number;
  averageAppointmentValue: number;
  monthlyData: {
    month: string;
    appointments: number;
    revenue: number;
  }[];
  servicesByCategory: {
    category: string;
    count: number;
    revenue: number;
  }[];
}

export interface PatientReport {
  totalRegisteredPatients: number;
  newPatientsThisMonth: number;
  patientsGrowthRate: number;
  ageDistribution: {
    ageRange: string;
    count: number;
  }[];
  monthlyNewPatients: {
    month: string;
    count: number;
  }[];
}

export interface AppointmentReport {
  totalAppointments: number;
  confirmedAppointments: number;
  canceledAppointments: number;
  noShowRate: number;
  attendanceRate: number;
  busyHours: {
    hour: string;
    count: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  monthlyAppointments: {
    month: string;
    total: number;
    confirmed: number;
    canceled: number;
  }[];
}

// Funções auxiliares
interface RealizedAppointmentLite {
  appointmentAt: string;
  status: string;
  service?: { price?: number; category?: string } | null;
}

async function getMonthlyDataLocal(
  realizedAppointments: RealizedAppointmentLite[]
) {
  const months: { month: string; appointments: number; revenue: number }[] = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const monthKey = date.getMonth();
    const filtered = realizedAppointments.filter((a) => {
      const d = new Date(a.appointmentAt);
      return (
        d.getFullYear() === date.getFullYear() && d.getMonth() === monthKey
      );
    });
    const revenue = filtered.reduce(
      (sum, a) => sum + (a.service?.price || 0),
      0
    );
    months.push({
      month: date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      }),
      appointments: filtered.length,
      revenue,
    });
  }
  return months;
}

async function getServicesByCategoryLocal(
  realizedAppointments: RealizedAppointmentLite[]
) {
  const categoryMap = new Map<string, { count: number; revenue: number }>();
  realizedAppointments.forEach((a) => {
    const cat = a.service?.category || 'outros';
    const price = a.service?.price || 0;
    const existing = categoryMap.get(cat) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += price;
    categoryMap.set(cat, existing);
  });
  return Array.from(categoryMap.entries()).map(([category, v]) => ({
    category,
    count: v.count,
    revenue: v.revenue,
  }));
}

function calculateAgeDistribution(patients: { birth_date: string }[]) {
  const ageRanges = [
    { min: 0, max: 12, label: '0-12 anos' },
    { min: 13, max: 18, label: '13-18 anos' },
    { min: 19, max: 30, label: '19-30 anos' },
    { min: 31, max: 50, label: '31-50 anos' },
    { min: 51, max: 65, label: '51-65 anos' },
    { min: 66, max: 120, label: '65+ anos' },
  ];

  return ageRanges.map((range) => {
    const count = patients.filter((patient) => {
      const age =
        new Date().getFullYear() - new Date(patient.birth_date).getFullYear();
      return age >= range.min && age <= range.max;
    }).length;

    return {
      ageRange: range.label,
      count,
    };
  });
}

interface PatientLite {
  createdAt: string;
  birthDate?: string | null;
}
function getMonthlyNewPatientsLocal(patients: PatientLite[]) {
  const months: { month: string; count: number }[] = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i + 1,
      1
    );
    const count = patients.filter((p) => {
      const created = new Date(p.createdAt);
      return created >= date && created < nextMonth;
    }).length;
    months.push({
      month: date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      }),
      count,
    });
  }
  return months;
}

function calculateBusyHours(appointments: { appointment_at: string }[]) {
  const hourMap = new Map();

  appointments.forEach((apt) => {
    const hour = new Date(apt.appointment_at).getHours();
    const hourLabel = `${hour}:00`;
    hourMap.set(hourLabel, (hourMap.get(hourLabel) || 0) + 1);
  });

  return Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function calculateStatusDistribution(appointments: { status: string }[]) {
  const statusMap = new Map();
  const total = appointments.length;

  appointments.forEach((apt) => {
    statusMap.set(apt.status, (statusMap.get(apt.status) || 0) + 1);
  });

  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

function getMonthlyAppointmentsLocal(appointments: RealizedAppointmentLite[]) {
  const months: {
    month: string;
    total: number;
    confirmed: number;
    canceled: number;
  }[] = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const nextMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i + 1,
      1
    );
    const filtered = appointments.filter((a) => {
      const d = new Date(a.appointmentAt);
      return d >= date && d < nextMonth;
    });
    const total = filtered.length;
    const confirmed = filtered.filter((a) => a.status === 'realizada').length;
    const canceled = filtered.filter((a) => a.status === 'cancelada').length;
    months.push({
      month: date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      }),
      total,
      confirmed,
      canceled,
    });
  }
  return months;
}

export const reportService = {
  async getClinicProductionReport(): Promise<ClinicProductionReport> {
    try {
      // Tenta usar endpoint backend direto se existir
      try {
        return await apiGet<ClinicProductionReport>(
          '/api/reports/clinic-production'
        );
      } catch (_e) {
        // fallback local
      }
      const allAppointments = await appointmentService.getAllAppointments(true);
      const realized = allAppointments.filter(
        (a: RealizedAppointmentLite) => a.status === 'realizada'
      );
      const totalAppointments = realized.length;
      const totalRevenue = realized.reduce(
        (s: number, a: RealizedAppointmentLite) => s + (a.service?.price || 0),
        0
      );
      const averageAppointmentValue =
        totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
      const monthlyData = await getMonthlyDataLocal(realized);
      const servicesByCategory = await getServicesByCategoryLocal(realized);
      if (totalAppointments === 0) {
        return {
          totalAppointments: 0,
          totalRevenue: 0,
          averageAppointmentValue: 0,
          monthlyData,
          servicesByCategory,
        };
      }
      return {
        totalAppointments,
        totalRevenue,
        averageAppointmentValue,
        monthlyData,
        servicesByCategory,
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de produção:', error);
      throw error;
    }
  },

  async getPatientReport(): Promise<PatientReport> {
    try {
      try {
        return await apiGet<PatientReport>('/api/reports/patients');
      } catch (_e) {
        /* fallback to local aggregation */
      }
      const patients = await patientService.getAllPatients();
      const totalRegisteredPatients = patients.length;
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const newPatientsThisMonth = patients.filter(
        (p: PatientLite) => new Date(p.createdAt) >= firstDayOfMonth
      ).length;
      const patientsGrowthRate =
        totalRegisteredPatients > 0
          ? (newPatientsThisMonth / totalRegisteredPatients) * 100
          : 0;
      const ageDistribution = calculateAgeDistribution(
        patients.map((p: PatientLite) => ({
          birth_date: p.birthDate || '',
        })) as { birth_date: string }[]
      );
      const monthlyNewPatients = getMonthlyNewPatientsLocal(patients);
      return {
        totalRegisteredPatients,
        newPatientsThisMonth,
        patientsGrowthRate,
        ageDistribution,
        monthlyNewPatients,
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de pacientes:', error);
      throw error;
    }
  },

  async getAppointmentReport(): Promise<AppointmentReport> {
    try {
      try {
        return await apiGet<AppointmentReport>('/api/reports/appointments');
      } catch (_e) {
        /* fallback to local aggregation */
      }
      const allAppointments = (await appointmentService.getAllAppointments(
        true
      )) as RealizedAppointmentLite[];
      const totalAppointments = allAppointments.length;
      const confirmedAppointments = allAppointments.filter(
        (a: RealizedAppointmentLite) => a.status === 'realizada'
      ).length;
      const canceledAppointments = allAppointments.filter(
        (a: RealizedAppointmentLite) => a.status === 'cancelada'
      ).length;
      const noShowAppointments = allAppointments.filter(
        (a: RealizedAppointmentLite) => a.status === 'nao_compareceu'
      ).length;
      const noShowRate =
        totalAppointments > 0
          ? (noShowAppointments / totalAppointments) * 100
          : 0;
      const attendanceRate =
        totalAppointments > 0
          ? (confirmedAppointments / totalAppointments) * 100
          : 0;
      const busyHours = calculateBusyHours(
        allAppointments.map((a: RealizedAppointmentLite) => ({
          appointment_at: a.appointmentAt,
        }))
      );
      const statusDistribution = calculateStatusDistribution(allAppointments);
      const monthlyAppointments = getMonthlyAppointmentsLocal(allAppointments);
      return {
        totalAppointments,
        confirmedAppointments,
        canceledAppointments,
        noShowRate,
        attendanceRate,
        busyHours,
        statusDistribution,
        monthlyAppointments,
      };
    } catch (error) {
      console.error('Erro ao buscar relatório de consultas:', error);
      throw error;
    }
  },
};
