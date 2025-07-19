// Tipos baseados no schema do Supabase para serviços
export interface Service {
  id: number;
  name: string;
  category: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dados para criar um novo serviço
export interface CreateServiceData {
  name: string;
  category: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active?: boolean;
}

// Dados para atualizar um serviço
export interface UpdateServiceData extends Partial<CreateServiceData> {
  id: number;
}

// Dados brutos do Supabase
export interface SupabaseService {
  id: number;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Dados para inserir no Supabase
export interface SupabaseServiceInsert {
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  active: boolean;
}

// Dados para atualizar no Supabase
export interface SupabaseServiceUpdate {
  name?: string;
  category?: string;
  description?: string | null;
  duration_minutes?: number;
  price?: number;
  active?: boolean;
}

// Filtros para busca de serviços
export interface ServiceFilters {
  search?: string;
  category?: string;
  active?: boolean;
  priceRange?: string;
  duration?: string;
}

// Estatísticas de serviços
export interface ServiceStats {
  total: number;
  active: number;
  byCategory: Record<string, number>;
  averagePrice: number;
}

// Categorias de serviço (baseadas no ENUM do banco)
export enum ServiceCategory {
  CLINICO_GERAL = 'clinico_geral',
  ORTODONTIA = 'ortodontia',
  ENDODONTIA = 'endodontia',
  IMPLANTODONTIA = 'implantodontia',
  PERIODONTIA = 'periodontia',
  PROTESES = 'proteses',
  ODONTOPEDIATRIA = 'odontopediatria',
  CIRURGIA = 'cirurgia',
  RADIOLOGIA = 'radiologia',
  ESTETICA = 'estetica',
  PREVENTIVO = 'preventivo',
  OUTROS = 'outros'
}

// Mapeamento de categorias para exibição
export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  [ServiceCategory.CLINICO_GERAL]: 'Clínico Geral',
  [ServiceCategory.ORTODONTIA]: 'Ortodontia',
  [ServiceCategory.ENDODONTIA]: 'Endodontia',
  [ServiceCategory.IMPLANTODONTIA]: 'Implantodontia',
  [ServiceCategory.PERIODONTIA]: 'Periodontia',
  [ServiceCategory.PROTESES]: 'Próteses',
  [ServiceCategory.ODONTOPEDIATRIA]: 'Odontopediatria',
  [ServiceCategory.CIRURGIA]: 'Cirurgia',
  [ServiceCategory.RADIOLOGIA]: 'Radiologia',
  [ServiceCategory.ESTETICA]: 'Estética',
  [ServiceCategory.PREVENTIVO]: 'Preventivo',
  [ServiceCategory.OUTROS]: 'Outros'
};

// Resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
} 