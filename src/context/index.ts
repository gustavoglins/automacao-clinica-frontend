// Barrel de re-exports para Providers e hooks (mantém fast refresh nos arquivos de provider)
export { AppointmentProvider } from './AppointmentContext';
export { EmployeeProvider } from './EmployeeContext';
export { PatientProvider } from './PatientContext';
export { ServiceProvider } from './ServiceContext';
export { ConvenioProvider } from './ConvenioContext';
export { DashboardProvider } from './DashboardContext';
export { AuthProvider } from './AuthContext';

// Hooks
export { useAppointments } from './hooks/useAppointments';
export { useEmployees } from './hooks/useEmployees';
export { usePatients } from './hooks/usePatients';
export { useServices } from './hooks/useServices';
export { useConvenios } from './hooks/useConvenios';
export { useDashboard } from './hooks/useDashboard';
