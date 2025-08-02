export interface ClinicHours {
  id: number;
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
  isOpen: boolean;
}

export interface CreateClinicHoursData {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
  isOpen: boolean;
}

export interface UpdateClinicHoursData {
  openTime?: string | null;
  closeTime?: string | null;
  isOpen?: boolean;
}

// Mapeamento dos dias da semana (banco em inglês -> exibição em português)
export const DAYS_OF_WEEK = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;

export type DayOfWeek = keyof typeof DAYS_OF_WEEK;
