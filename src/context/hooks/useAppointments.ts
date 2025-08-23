import { useContext } from 'react';
import AppointmentContext from '../internal/AppointmentContextInternal';

export function useAppointments() {
  const ctx = useContext(AppointmentContext);
  if (!ctx)
    throw new Error('useAppointments must be used within AppointmentProvider');
  return ctx;
}
