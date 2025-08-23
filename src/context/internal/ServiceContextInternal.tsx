import { createContext } from 'react';
import type { Service } from '@/types/service';

interface ServiceContextProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  loading: boolean;
  fetchServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextProps | undefined>(
  undefined
);
export default ServiceContext;
