// Backend-only payment method service
import { toast } from 'sonner';
import { webhookService, WebhookOperation } from '@/services/webhookService';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
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
      const rows = await apiGet<SupabasePaymentMethod[]>(
        '/api/payment-methods'
      );
      return rows.map(PaymentMethodTransformer.fromSupabase);
    } catch (e) {
      console.error('Erro ao buscar métodos de pagamento', e);
      toast.error('Erro ao carregar métodos de pagamento');
      throw e;
    }
  }

  async create(payload: CreatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const insertData = PaymentMethodTransformer.toSupabaseInsert(payload);
      const created = await apiPost<SupabasePaymentMethod>(
        '/api/payment-methods',
        insertData
      );
      toast.success('Método de pagamento adicionado');
      await webhookService.notifyPaymentMethods(WebhookOperation.INSERT);
      return PaymentMethodTransformer.fromSupabase(created);
    } catch (e) {
      toast.error('Erro ao adicionar método de pagamento');
      throw e;
    }
  }

  async update(payload: UpdatePaymentMethodData): Promise<PaymentMethod> {
    try {
      const updateData = PaymentMethodTransformer.toSupabaseUpdate(payload);
      const updated = await apiPut<SupabasePaymentMethod>(
        `/api/payment-methods/${payload.id}`,
        updateData
      );
      toast.success('Método de pagamento atualizado');
      await webhookService.notifyPaymentMethods(WebhookOperation.UPDATE);
      return PaymentMethodTransformer.fromSupabase(updated);
    } catch (e) {
      toast.error('Erro ao atualizar método de pagamento');
      throw e;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiDelete(`/api/payment-methods/${id}`);
      toast.success('Método de pagamento removido');
      await webhookService.notifyPaymentMethods(WebhookOperation.DELETE, id);
    } catch (e) {
      toast.error('Erro ao remover método de pagamento');
      throw e;
    }
  }

  async search(term: string): Promise<PaymentMethod[]> {
    const all = await this.getAll();
    const t = term.trim().toLowerCase();
    if (!t) return all;
    return all.filter((m) => m.name.toLowerCase().includes(t));
  }

  async filter(filters: PaymentMethodFilters): Promise<PaymentMethod[]> {
    const all = await this.getAll();
    return all.filter((m) => {
      if (
        filters.search &&
        !m.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.active !== undefined && m.active !== filters.active)
        return false;
      return true;
    });
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
