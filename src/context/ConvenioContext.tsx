import { useEffect, useState } from 'react';
import { convenioService } from '@/services/convenioService';
import { isBackendEnabled } from '@/lib/apiClient';
import type { Convenio } from '@/types/convenio';
import ConvenioContext from './internal/ConvenioContextInternal';

interface ConvenioContextProps {
  convenios: Convenio[];
  setConvenios: React.Dispatch<React.SetStateAction<Convenio[]>>;
  loading: boolean;
  fetchConvenios: () => Promise<void>;
}

// Hook movido para hooks/useConvenios.ts

export function ConvenioProvider({ children }: { children: React.ReactNode }) {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConvenios = async () => {
    setLoading(true);
    try {
      if (!isBackendEnabled) {
        setConvenios([]);
        return;
      }
      const data = await convenioService.getAll();
      setConvenios(data);
    } catch (e) {
      // erro já notificado
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (convenios.length === 0) fetchConvenios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConvenioContext.Provider
      value={{ convenios, setConvenios, loading, fetchConvenios }}
    >
      {children}
    </ConvenioContext.Provider>
  );
}
