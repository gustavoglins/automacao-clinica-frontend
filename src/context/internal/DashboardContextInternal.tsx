import { createContext } from 'react';
import {
  DashboardStats,
  TodayAppointment,
  NextAppointment,
} from '@/services/dashboardService';

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

const DashboardContext = createContext<DashboardContextProps | undefined>(
  undefined
);
export default DashboardContext;
