import { createContext, useContext, useEffect, useState } from "react";
import { serviceService } from "@/services/servicesService";
import type { Service } from "@/types/service";

interface ServiceContextProps {
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    loading: boolean;
    fetchServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(undefined);

export function useServices() {
    const ctx = useContext(ServiceContext);
    if (!ctx) throw new Error("useServices must be used within ServiceProvider");
    return ctx;
}

export function ServiceProvider({ children }: { children: React.ReactNode }) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const data = await serviceService.getAllServices();
            setServices(data);
        } catch (error) {
            // erro já tratado no service
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (services.length === 0) fetchServices();
        // eslint-disable-next-line
    }, []);

    return (
        <ServiceContext.Provider value={{ services, setServices, loading, fetchServices }}>
            {children}
        </ServiceContext.Provider>
    );
} 