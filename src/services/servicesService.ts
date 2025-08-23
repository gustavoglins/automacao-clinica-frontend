// Supabase removido: backend é fonte única agora
import { toast } from 'sonner';
import { webhookService, WebhookOperation } from './webhookService';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/apiClient';
import type {
  Service,
  CreateServiceData,
  UpdateServiceData,
  SupabaseService,
  SupabaseServiceInsert,
  SupabaseServiceUpdate,
  ServiceFilters,
  ServiceStats,
  ValidationResult,
  ServiceCategory,
  SERVICE_CATEGORY_LABELS,
} from '@/types/service';

// Re-export types for backward compatibility
export type {
  Service,
  CreateServiceData,
  UpdateServiceData,
  ServiceFilters,
  ServiceStats,
  ValidationResult,
};

// Transformer original preservado (usa naming Supabase -> app)
class ServiceTransformer {
  static fromSupabase(
    s: SupabaseService & { times_used?: number | null }
  ): Service {
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      durationMinutes: s.duration_minutes,
      price: s.price,
      active: s.active,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
      times_used: s.times_used ?? 0,
    } as Service;
  }
  static toSupabaseInsert(data: CreateServiceData): SupabaseServiceInsert {
    return {
      name: data.name,
      category: data.category,
      description: data.description || null,
      duration_minutes: data.durationMinutes,
      price: data.price,
      active: data.active ?? true,
    };
  }
  static toSupabaseUpdate(data: UpdateServiceData): SupabaseServiceUpdate {
    const u: SupabaseServiceUpdate = {};
    if (data.name !== undefined) u.name = data.name;
    if (data.category !== undefined) u.category = data.category;
    if (data.description !== undefined)
      u.description = data.description || null;
    if (data.durationMinutes !== undefined)
      u.duration_minutes = data.durationMinutes;
    if (data.price !== undefined) u.price = data.price;
    if (data.active !== undefined) u.active = data.active;
    return u;
  }
}

class ServiceService {
  async getAllServices(): Promise<Service[]> {
    try {
      const data = await apiGet<SupabaseService[]>('/api/services');
      return data.map(ServiceTransformer.fromSupabase);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erro ao carregar serviços');
      throw error;
    }
  }

  async getServiceById(id: number): Promise<Service | null> {
    try {
      const data = await apiGet<SupabaseService>(`/api/services/${id}`);
      return ServiceTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      toast.error('Erro ao carregar serviço');
      throw error;
    }
  }

  async createService(serviceData: CreateServiceData): Promise<Service> {
    try {
      const insertData = ServiceTransformer.toSupabaseInsert(serviceData);
      const created = await apiPost<SupabaseService>(
        '/api/services',
        insertData
      );
      toast.success('Serviço adicionado com sucesso!');
      await webhookService.notifyServices(WebhookOperation.INSERT);
      return ServiceTransformer.fromSupabase(created);
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Erro ao adicionar serviço');
      throw error;
    }
  }

  async updateService(serviceData: UpdateServiceData): Promise<Service> {
    try {
      const updateData = ServiceTransformer.toSupabaseUpdate(serviceData);
      const updated = await apiPut<SupabaseService>(
        `/api/services/${serviceData.id}`,
        updateData
      );
      toast.success('Serviço atualizado com sucesso!');
      await webhookService.notifyServices(WebhookOperation.UPDATE);
      return ServiceTransformer.fromSupabase(updated);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Erro ao atualizar serviço');
      throw error;
    }
  }

  async deleteService(id: number): Promise<void> {
    try {
      await apiDelete(`/api/services/${id}`);
      toast.success('Serviço removido com sucesso!');
      await webhookService.notifyServices(WebhookOperation.DELETE, id);
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error);
      throw error;
    }
  }

  async searchServices(searchTerm: string): Promise<Service[]> {
    try {
      if (!searchTerm.trim()) return this.getAllServices();
      const all = await this.getAllServices();
      const term = searchTerm.toLowerCase();
      return all.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.description?.toLowerCase().includes(term) ?? false)
      );
    } catch (error) {
      console.error('Error searching services:', error);
      toast.error('Erro ao buscar serviços');
      throw error;
    }
  }

  async filterServices(filters: ServiceFilters): Promise<Service[]> {
    try {
      const all = await this.getAllServices();
      return all.filter((s) => {
        if (filters.search) {
          const term = filters.search.toLowerCase();
          if (
            !(
              s.name.toLowerCase().includes(term) ||
              (s.description?.toLowerCase().includes(term) ?? false)
            )
          )
            return false;
        }
        if (filters.category && filters.category !== 'all') {
          if (s.category !== filters.category) return false;
        }
        if (filters.active !== undefined && s.active !== filters.active)
          return false;
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split('-').map(Number);
          if (!isNaN(min) && s.price < min) return false;
          if (!isNaN(max) && s.price > max) return false;
        }
        if (filters.duration) {
          const [dMin, dMax] = filters.duration.split('-').map(Number);
          if (!isNaN(dMin) && s.durationMinutes < dMin) return false;
          if (!isNaN(dMax) && s.durationMinutes > dMax) return false;
        }
        return true;
      });
    } catch (error) {
      console.error('Error filtering services:', error);
      toast.error('Erro ao filtrar serviços');
      throw error;
    }
  }

  async getServiceStats(): Promise<ServiceStats> {
    try {
      const all = await this.getAllServices();
      const total = all.length;
      const active = all.filter((s) => s.active).length;
      const byCategory: Record<string, number> = {};
      all.forEach((s) => {
        byCategory[s.category] = (byCategory[s.category] || 0) + 1;
      });
      const averagePrice =
        total > 0 ? all.reduce((sum, s) => sum + s.price, 0) / total : 0;
      return { total, active, byCategory, averagePrice };
    } catch (error) {
      console.error('Error getting service stats:', error);
      toast.error('Erro ao carregar estatísticas');
      throw error;
    }
  }

  async getActiveServices(): Promise<Service[]> {
    try {
      const all = await this.getAllServices();
      return all.filter((s) => s.active);
    } catch (error) {
      console.error('Error fetching active services:', error);
      toast.error('Erro ao carregar serviços ativos');
      throw error;
    }
  }

  validateServiceData(
    data: CreateServiceData | UpdateServiceData
  ): ValidationResult {
    const errors: string[] = [];
    if (!data.name?.trim()) errors.push('Nome do serviço é obrigatório');
    if (!data.category?.trim()) errors.push('Categoria é obrigatória');
    if (data.durationMinutes !== undefined && data.durationMinutes <= 0)
      errors.push('Duração deve ser maior que zero');
    if (data.price !== undefined && data.price < 0)
      errors.push('Preço não pode ser negativo');
    return { isValid: errors.length === 0, errors };
  }
}
// Export singleton instance
export const serviceService = new ServiceService();
