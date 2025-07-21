import { createContext, useContext, useEffect, useState } from "react";
import { dashboardService, DashboardStats, TodayAppointment, NextAppointment } from "@/services/dashboardService";
import { employeeService } from "@/services/employeeService";
import { serviceService } from "@/services/servicesService";

interface DashboardContextProps {
    stats: DashboardStats;
    todayAppointments: TodayAppointment[];
    nextAppointment: NextAppointment | null;
    activeEmployees: number;
    activeServices: number;
    loading: boolean;
    fetchDashboardData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
    return ctx;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [stats, setStats] = useState<DashboardStats>({
        todayAppointments: 0,
        totalPatients: 0,
        monthlyRevenue: 0,
        attendanceRate: 0,
        totalAppointments: 0
    });
    const [activeEmployees, setActiveEmployees] = useState<number>(0);
    const [activeServices, setActiveServices] = useState<number>(0);
    const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
    const [nextAppointment, setNextAppointment] = useState<NextAppointment | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, appointmentsData, nextAppointmentData, employees, serviceStats] = await Promise.all([
                dashboardService.getDashboardStats(),
                dashboardService.getTodayAppointments(),
                dashboardService.getNextAppointment(),
                employeeService.getAllEmployees(),
                serviceService.getServiceStats()
            ]);
            setStats(statsData);
            setTodayAppointments(appointmentsData);
            setNextAppointment(nextAppointmentData);
            setActiveEmployees(employees.filter(e => e.status === 'ativo').length);
            setActiveServices(serviceStats.active);
        } catch (error) {
            // erro já tratado no service
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line
    }, []);

    return (
        <DashboardContext.Provider value={{ stats, todayAppointments, nextAppointment, activeEmployees, activeServices, loading, fetchDashboardData }}>
            {children}
        </DashboardContext.Provider>
    );
} 