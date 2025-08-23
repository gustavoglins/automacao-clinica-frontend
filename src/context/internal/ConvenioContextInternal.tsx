import { createContext } from 'react';
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
export default ConvenioContext;
