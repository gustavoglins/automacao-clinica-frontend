import { useEffect, useState } from 'react';
import { patientService } from '@/services/patientService';
import { isBackendEnabled } from '@/lib/apiClient';
import type { Patient } from '@/types/patient';
import PatientContext from './internal/PatientContextInternal';

interface PatientContextProps {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  loading: boolean;
  fetchPatients: () => Promise<void>;
}

// Hook movido para hooks/usePatients.ts

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      if (!isBackendEnabled) {
        setPatients([]);
        return;
      }
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (error) {
      // erro já tratado no service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patients.length === 0) fetchPatients();
    // eslint-disable-next-line
  }, []);

  return (
    <PatientContext.Provider
      value={{ patients, setPatients, loading, fetchPatients }}
    >
      {children}
    </PatientContext.Provider>
  );
}
