import { useEffect, useState } from 'react';
import {
  dashboardService,
  DashboardStats,
  TodayAppointment,
  NextAppointment,
} from '@/services/dashboardService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { appointmentService } from '@/services/appointmentService';
import { isBackendEnabled } from '@/lib/apiClient';
import DashboardContext from './internal/DashboardContextInternal';

interface DashboardContextProps {
  stats: DashboardStats;
  todayAppointments: TodayAppointment[];
  nextAppointment: NextAppointment | null;
  activeEmployees: number;
  activeServices: number;
  allScheduledAppointments: number;
  loading: boolean;
  fetchDashboardData: () => Promise<void>;
}

// Hook movido para hooks/useDashboard.ts

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    totalPatients: 0,
    activePatients: 0,
    monthlyRevenue: 0,
    attendanceRate: 0,
    totalAppointments: 0,
  });
  const [activeEmployees, setActiveEmployees] = useState<number>(0);
  const [activeServices, setActiveServices] = useState<number>(0);
  const [allScheduledAppointments, setAllScheduledAppointments] =
    useState<number>(0);
  const [todayAppointments, setTodayAppointments] = useState<
    TodayAppointment[]
  >([]);
  const [nextAppointment, setNextAppointment] =
    useState<NextAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!isBackendEnabled) {
        // Fallback: zera estatísticas
        setStats({
          todayAppointments: 0,
          totalPatients: 0,
          activePatients: 0,
          monthlyRevenue: 0,
          attendanceRate: 0,
          totalAppointments: 0,
        });
        setTodayAppointments([]);
        setNextAppointment(null);
        setActiveEmployees(0);
        setActiveServices(0);
        setAllScheduledAppointments(0);
        return;
      }
      const [
        statsData,
        appointmentsData,
        nextAppointmentData,
        employees,
        serviceStats,
        allAppointments,
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getTodayAppointments(),
        dashboardService.getNextAppointment(),
        employeeService.getAllEmployees(),
        serviceService.getServiceStats(),
        appointmentService.getAllAppointments(),
      ]);
      setStats(statsData);
      setTodayAppointments(appointmentsData);
      setNextAppointment(nextAppointmentData);
      setActiveEmployees(employees.filter((e) => e.status === 'ativo').length);
      setActiveServices(serviceStats.active);
      const scheduledAppointments = allAppointments.filter((appointment) =>
        ['agendada', 'confirmada', 'reagendada'].includes(appointment.status)
      );
      setAllScheduledAppointments(scheduledAppointments.length);
    } catch (error) {
      // erro já tratado no service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        todayAppointments,
        nextAppointment,
        activeEmployees,
        activeServices,
        allScheduledAppointments,
        loading,
        fetchDashboardData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
