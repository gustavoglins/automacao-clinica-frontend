import { supabase } from "@/lib/supabaseClient";

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
async function getMonthlyData() {
  const months = [];
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

    const { data: appointments } = await supabase
      .from("appointments")
      .select(
        `
        id,
        services (price)
      `
      )
      .eq("status", "realizada")
      .gte("appointment_at", date.toISOString())
      .lt("appointment_at", nextMonth.toISOString());

    months.push({
      month: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      }),
      appointments: appointments?.length || 0,
      revenue:
        appointments?.reduce((sum, apt) => {
          const service = Array.isArray(apt.services)
            ? apt.services[0]
            : apt.services;
          return sum + (service?.price || 0);
        }, 0) || 0,
    });
  }

  return months;
}

async function getServicesByCategory() {
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      services (
        category,
        price
      )
    `
    )
    .eq("status", "realizada");

  const categoryMap = new Map();

  appointments?.forEach((apt) => {
    const service = Array.isArray(apt.services)
      ? apt.services[0]
      : apt.services;
    const category = service?.category || "outros";
    const price = service?.price || 0;

    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category);
      categoryMap.set(category, {
        count: existing.count + 1,
        revenue: existing.revenue + price,
      });
    } else {
      categoryMap.set(category, { count: 1, revenue: price });
    }
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    revenue: data.revenue,
  }));
}

function calculateAgeDistribution(patients: { birth_date: string }[]) {
  const ageRanges = [
    { min: 0, max: 12, label: "0-12 anos" },
    { min: 13, max: 18, label: "13-18 anos" },
    { min: 19, max: 30, label: "19-30 anos" },
    { min: 31, max: 50, label: "31-50 anos" },
    { min: 51, max: 65, label: "51-65 anos" },
    { min: 66, max: 120, label: "65+ anos" },
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

async function getMonthlyNewPatients() {
  const months = [];
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

    const { data: patients } = await supabase
      .from("patients")
      .select("id")
      .gte("created_at", date.toISOString())
      .lt("created_at", nextMonth.toISOString());

    months.push({
      month: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      }),
      count: patients?.length || 0,
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

async function getMonthlyAppointments() {
  const months = [];
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

    const { data: appointments } = await supabase
      .from("appointments")
      .select("status")
      .gte("appointment_at", date.toISOString())
      .lt("appointment_at", nextMonth.toISOString());

    const total = appointments?.length || 0;
    const confirmed =
      appointments?.filter((a) => a.status === "realizada").length || 0;
    const canceled =
      appointments?.filter((a) => a.status === "cancelada").length || 0;

    months.push({
      month: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
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
      // Buscar agendamentos com serviços
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(
          `
          id,
          appointment_at,
          status,
          services (
            price,
            category
          )
        `
        )
        .eq("status", "realizada");

      if (appointmentsError) throw appointmentsError;

      const totalAppointments = appointments?.length || 0;
      const totalRevenue =
        appointments?.reduce((sum, apt) => {
          const service = Array.isArray(apt.services)
            ? apt.services[0]
            : apt.services;
          return sum + (service?.price || 0);
        }, 0) || 0;
      const averageAppointmentValue =
        totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

      // Dados mensais dos últimos 6 meses
      const monthlyData = await getMonthlyData();

      // Dados por categoria de serviço
      const servicesByCategory = await getServicesByCategory();

      return {
        totalAppointments,
        totalRevenue,
        averageAppointmentValue,
        monthlyData,
        servicesByCategory,
      };
    } catch (error) {
      console.error("Erro ao buscar relatório de produção:", error);
      throw error;
    }
  },

  async getPatientReport(): Promise<PatientReport> {
    try {
      // Total de pacientes ativos
      const { data: patients, error: patientsError } = await supabase
        .from("patients")
        .select("id, created_at, birth_date");

      if (patientsError) throw patientsError;

      const totalRegisteredPatients = patients?.length || 0;

      // Novos pacientes este mês
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const newPatientsThisMonth =
        patients?.filter((p) => new Date(p.created_at) >= firstDayOfMonth)
          .length || 0;

      // Taxa de crescimento (simulada)
      const patientsGrowthRate =
        totalRegisteredPatients > 0
          ? (newPatientsThisMonth / totalRegisteredPatients) * 100
          : 0;

      // Distribuição por idade
      const ageDistribution = calculateAgeDistribution(patients || []);

      // Dados mensais dos novos pacientes
      const monthlyNewPatients = await getMonthlyNewPatients();

      return {
        totalRegisteredPatients,
        newPatientsThisMonth,
        patientsGrowthRate,
        ageDistribution,
        monthlyNewPatients,
      };
    } catch (error) {
      console.error("Erro ao buscar relatório de pacientes:", error);
      throw error;
    }
  },

  async getAppointmentReport(): Promise<AppointmentReport> {
    try {
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select("id, appointment_at, status");

      if (error) throw error;

      const totalAppointments = appointments?.length || 0;
      const confirmedAppointments =
        appointments?.filter((a) => a.status === "realizada").length || 0;
      const canceledAppointments =
        appointments?.filter((a) => a.status === "cancelada").length || 0;
      const noShowAppointments =
        appointments?.filter((a) => a.status === "nao_compareceu").length || 0;

      const noShowRate =
        totalAppointments > 0
          ? (noShowAppointments / totalAppointments) * 100
          : 0;
      const attendanceRate =
        totalAppointments > 0
          ? (confirmedAppointments / totalAppointments) * 100
          : 0;

      // Horários mais movimentados
      const busyHours = calculateBusyHours(appointments || []);

      // Distribuição por status
      const statusDistribution = calculateStatusDistribution(
        appointments || []
      );

      // Dados mensais
      const monthlyAppointments = await getMonthlyAppointments();

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
      console.error("Erro ao buscar relatório de consultas:", error);
      throw error;
    }
  },
};
