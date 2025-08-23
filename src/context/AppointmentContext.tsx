import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { isBackendEnabled } from '@/lib/apiClient';
import type { Appointment } from '@/types/appointment';
import AppointmentContext from './internal/AppointmentContextInternal';

interface AppointmentContextProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  loading: boolean;
  fetchAppointments: () => Promise<void>;
}

// Hook movido para hooks/useAppointments.ts

export function AppointmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      if (!isBackendEnabled) {
        setAppointments([]); // fallback vazio em modo sem backend
        return;
      }
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
    <AppointmentContext.Provider
      value={{ appointments, setAppointments, loading, fetchAppointments }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}
