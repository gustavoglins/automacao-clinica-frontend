import { createContext, useContext, useEffect, useState } from 'react';
import { convenioService } from '@/services/convenioService';
import type { Convenio } from '@/types/convenio';

interface ConvenioContextProps {
  convenios: Convenio[];
  setConvenios: React.Dispatch<React.SetStateAction<Convenio[]>>;
  loading: boolean;
  fetchConvenios: () => Promise<void>;
}

const ConvenioContext = createContext<ConvenioContextProps | undefined>(
  undefined
);

export function useConvenios() {
  const ctx = useContext(ConvenioContext);
  if (!ctx)
    throw new Error('useConvenios must be used within ConvenioProvider');
  return ctx;
}

export function ConvenioProvider({ children }: { children: React.ReactNode }) {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConvenios = async () => {
    setLoading(true);
    try {
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
