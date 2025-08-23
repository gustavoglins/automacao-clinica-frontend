import { useContext } from 'react';
import PatientContext from '../internal/PatientContextInternal';

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatients must be used within PatientProvider');
  return ctx;
}
