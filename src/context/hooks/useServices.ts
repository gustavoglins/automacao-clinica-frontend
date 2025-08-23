import { useContext } from 'react';
import ServiceContext from '../internal/ServiceContextInternal';

export function useServices() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServices must be used within ServiceProvider');
  return ctx;
}
