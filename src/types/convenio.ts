// Tipos baseados no schema do Supabase para convenios
export interface Convenio {
  id: number;
  nome: string;
  abrangencia: string;
  tipo_cobertura: string;
  telefone_contato: string | null;
  email_contato: string | null;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface CreateConvenioData {
  nome: string;
  abrangencia: string;
  tipo_cobertura: string;
  telefone_contato?: string | null;
  email_contato?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}

export interface UpdateConvenioData extends Partial<CreateConvenioData> {
  id: number;
}

export interface SupabaseConvenio {
  id: number;
  nome: string;
  abrangencia: string;
  tipo_cobertura: string;
  telefone_contato: string | null;
  email_contato: string | null;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface SupabaseConvenioInsert {
  nome: string;
  abrangencia: string;
  tipo_cobertura: string;
  telefone_contato: string | null;
  email_contato: string | null;
  observacoes: string | null;
  ativo: boolean;
}

export interface SupabaseConvenioUpdate {
  nome?: string;
  abrangencia?: string;
  tipo_cobertura?: string;
  telefone_contato?: string | null;
  email_contato?: string | null;
  observacoes?: string | null;
  ativo?: boolean;
}

export interface ConvenioFilters {
  search?: string;
  abrangencia?: string;
  tipo_cobertura?: string;
  ativo?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
