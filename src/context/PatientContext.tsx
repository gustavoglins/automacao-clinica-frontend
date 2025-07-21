import { createContext, useContext, useEffect, useState } from "react";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types/patient";

interface PatientContextProps {
    patients: Patient[];
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
    loading: boolean;
    fetchPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextProps | undefined>(undefined);

export function usePatients() {
    const ctx = useContext(PatientContext);
    if (!ctx) throw new Error("usePatients must be used within PatientProvider");
    return ctx;
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        setLoading(true);
        try {
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
        <PatientContext.Provider value={{ patients, setPatients, loading, fetchPatients }}>
            {children}
        </PatientContext.Provider>
    );
} 