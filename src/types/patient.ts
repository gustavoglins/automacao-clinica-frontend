export interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  lastVisit: string;
  nextVisit: string | null;
  status: 'ativo' | 'inativo';
  plan: string;
}

export type PatientStatus = 'ativo' | 'inativo' | '';
