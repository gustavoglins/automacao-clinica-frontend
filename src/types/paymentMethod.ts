// Tipos para métodos de pagamento (payment_methods)

export interface PaymentMethod {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string; // from created_at
  updatedAt: string; // from updated_at
}

export interface CreatePaymentMethodData {
  name: string;
  description?: string | null;
  active?: boolean;
}

export interface UpdatePaymentMethodData
  extends Partial<CreatePaymentMethodData> {
  id: number;
}

// Formatos alinhados ao schema do Supabase
export interface SupabasePaymentMethod {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabasePaymentMethodInsert {
  name: string;
  description: string | null;
  active: boolean;
}

export interface SupabasePaymentMethodUpdate {
  name?: string;
  description?: string | null;
  active?: boolean;
}

export interface PaymentMethodFilters {
  search?: string;
  active?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
