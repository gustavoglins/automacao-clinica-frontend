import { createContext, useContext, useEffect, useState } from "react";
import { employeeService } from "@/services/employeeService";
import type { Employee } from "@/types/employee";

interface EmployeeContextProps {
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    loading: boolean;
    fetchEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextProps | undefined>(undefined);

export function useEmployees() {
    const ctx = useContext(EmployeeContext);
    if (!ctx) throw new Error("useEmployees must be used within EmployeeProvider");
    return ctx;
}

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
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
        <EmployeeContext.Provider value={{ employees, setEmployees, loading, fetchEmployees }}>
            {children}
        </EmployeeContext.Provider>
    );
} 