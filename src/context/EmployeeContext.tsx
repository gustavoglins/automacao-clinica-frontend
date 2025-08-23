import { useEffect, useState } from 'react';
import { employeeService } from '@/services/employeeService';
import { isBackendEnabled } from '@/lib/apiClient';
import type { Employee } from '@/types/employee';
import EmployeeContext from './internal/EmployeeContextInternal';

interface EmployeeContextProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  loading: boolean;
  fetchEmployees: () => Promise<void>;
}

// Hook movido para hooks/useEmployees.ts

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      if (!isBackendEnabled) {
        setEmployees([]);
        return;
      }
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      // erro já tratado no service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employees.length === 0) fetchEmployees();
    // eslint-disable-next-line
  }, []);

  return (
    <EmployeeContext.Provider
      value={{ employees, setEmployees, loading, fetchEmployees }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}
