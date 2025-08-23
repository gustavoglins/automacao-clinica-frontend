import { createContext } from 'react';
import type { Employee } from '@/types/employee';

interface EmployeeContextProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  loading: boolean;
  fetchEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextProps | undefined>(
  undefined
);
export default EmployeeContext;
