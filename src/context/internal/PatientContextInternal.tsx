import { createContext } from 'react';
import type { Patient } from '@/types/patient';

interface PatientContextProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  loading: boolean;
  fetchPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextProps | undefined>(
  undefined
);
export default PatientContext;
