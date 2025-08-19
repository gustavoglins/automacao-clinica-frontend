import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type {
  PaymentMethod,
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
  SupabasePaymentMethod,
  SupabasePaymentMethodInsert,
  SupabasePaymentMethodUpdate,
  PaymentMethodFilters,
  ValidationResult,
} from '@/types/paymentMethod';

class PaymentMethodTransformer {
  static fromSupabase(data: SupabasePaymentMethod): PaymentMethod {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static toSupabaseInsert(
    data: CreatePaymentMethodData
  ): SupabasePaymentMethodInsert {
    return {
      name: data.name,
      description: data.description ?? null,
      active: data.active ?? true,
    };
  }

  static toSupabaseUpdate(
    data: UpdatePaymentMethodData
  ): SupabasePaymentMethodUpdate {
    const out: SupabasePaymentMethodUpdate = {};
    if (data.name !== undefined) out.name = data.name;
    if (data.description !== undefined)
      out.description = data.description ?? null;
    if (data.active !== undefined) out.active = data.active;
    return out;
  }
}

class PaymentMethodService {
  async getAll(): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');
      if (error) throw error;
      return (data || []).map(PaymentMethodTransformer.fromSupabase);
    } catch (e) {
      console.error('Erro ao buscar métodos de pagamento', e);
      toast.error('Erro ao carregar métodos de pagamento');
      throw e;
    }
  }

  async create(payload: CreatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const insertData = PaymentMethodTransformer.toSupabaseInsert(payload);
      const { data, error } = await supabase
        .from('payment_methods')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      toast.success('Método de pagamento adicionado');
      return PaymentMethodTransformer.fromSupabase(
        data as SupabasePaymentMethod
      );
    } catch (e) {
      toast.error('Erro ao adicionar método de pagamento');
      throw e;
    }
  }

  async update(payload: UpdatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const updateData = PaymentMethodTransformer.toSupabaseUpdate(payload);
      const { data, error } = await supabase
        .from('payment_methods')
        .update(updateData)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      toast.success('Método de pagamento atualizado');
      return PaymentMethodTransformer.fromSupabase(
        data as SupabasePaymentMethod
      );
    } catch (e) {
      toast.error('Erro ao atualizar método de pagamento');
      throw e;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Método de pagamento removido');
    } catch (e) {
      toast.error('Erro ao remover método de pagamento');
      throw e;
    }
  }

  async search(term: string): Promise<PaymentMethod[]> {
    if (!term.trim()) return this.getAll();
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .ilike('name', `%${term}%`)
      .order('name');
    if (error) {
      toast.error('Erro na busca');
      throw error;
    }
    return (data || []).map(PaymentMethodTransformer.fromSupabase);
  }

  async filter(filters: PaymentMethodFilters): Promise<PaymentMethod[]> {
    let query = supabase.from('payment_methods').select('*');
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.active !== undefined) {
      query = query.eq('active', filters.active);
    }
    const { data, error } = await query.order('name');
    if (error) {
      toast.error('Erro ao filtrar métodos de pagamento');
      throw error;
    }
    return (data || []).map(PaymentMethodTransformer.fromSupabase);
  }

  validate(
    data: CreatePaymentMethodData | UpdatePaymentMethodData
  ): ValidationResult {
    const errors: string[] = [];
    if (!data.name || !data.name.trim()) errors.push('Nome é obrigatório');
    return { isValid: errors.length === 0, errors };
  }
}

export const paymentMethodService = new PaymentMethodService();
