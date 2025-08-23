import { useContext } from 'react';
import ConvenioContext from '../internal/ConvenioContextInternal';

export function useConvenios() {
  const ctx = useContext(ConvenioContext);
  if (!ctx)
    throw new Error('useConvenios must be used within ConvenioProvider');
  return ctx;
}
