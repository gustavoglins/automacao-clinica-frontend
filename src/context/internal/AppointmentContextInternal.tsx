import { createContext } from 'react';
import type { Appointment } from '@/types/appointment';

interface AppointmentContextProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  loading: boolean;
  fetchAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextProps | undefined>(
  undefined
);
export default AppointmentContext;
