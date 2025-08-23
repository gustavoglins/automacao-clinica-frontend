import { useContext } from 'react';
import EmployeeContext from '../internal/EmployeeContextInternal';

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx)
    throw new Error('useEmployees must be used within EmployeeProvider');
  return ctx;
}
