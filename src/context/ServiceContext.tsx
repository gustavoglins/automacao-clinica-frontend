import { useEffect, useState } from 'react';
import { serviceService } from '@/services/servicesService';
import { isBackendEnabled } from '@/lib/apiClient';
import type { Service } from '@/types/service';
import ServiceContext from './internal/ServiceContextInternal';

interface ServiceContextProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  loading: boolean;
  fetchServices: () => Promise<void>;
}

// Hook movido para hooks/useServices.ts

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      if (!isBackendEnabled) {
        setServices([]);
        return;
      }
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
    <ServiceContext.Provider
      value={{ services, setServices, loading, fetchServices }}
    >
      {children}
    </ServiceContext.Provider>
  );
}
