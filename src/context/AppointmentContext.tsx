import { createContext, useContext, useEffect, useState } from "react";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment } from "@/types/appointment";

interface AppointmentContextProps {
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    loading: boolean;
    fetchAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextProps | undefined>(undefined);

export function useAppointments() {
    const ctx = useContext(AppointmentContext);
    if (!ctx) throw new Error("useAppointments must be used within AppointmentProvider");
    return ctx;
}

export function AppointmentProvider({ children }: { children: React.ReactNode }) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await appointmentService.getAllAppointments();
            setAppointments(data);
        } catch (error) {
            // erro já tratado no service
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (appointments.length === 0) fetchAppointments();
        // eslint-disable-next-line
    }, []);

    return (
        <AppointmentContext.Provider value={{ appointments, setAppointments, loading, fetchAppointments }}>
            {children}
        </AppointmentContext.Provider>
    );
} 