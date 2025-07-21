import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
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
  SERVICE_CATEGORY_LABELS
} from '@/types/service';

// Re-export types for backward compatibility
export type {
  Service,
  CreateServiceData,
  UpdateServiceData,
  ServiceFilters,
  ServiceStats,
  ValidationResult,
  ServiceCategory
};

export { SERVICE_CATEGORY_LABELS };

/**
 * Utility functions for data transformation
 */
class ServiceTransformer {
  /**
   * Transform Supabase service data to app Service interface
   */
  static fromSupabase(supabaseService: SupabaseService): Service {
    return {
      id: supabaseService.id,
      name: supabaseService.name,
      category: supabaseService.category,
      description: supabaseService.description,
      durationMinutes: supabaseService.duration_minutes,
      price: supabaseService.price,
      active: supabaseService.active,
      createdAt: supabaseService.created_at,
      updatedAt: supabaseService.updated_at,
      times_used: supabaseService.times_used ?? 0
    };
  }

  /**
   * Transform CreateServiceData to Supabase insert format
   */
  static toSupabaseInsert(serviceData: CreateServiceData): SupabaseServiceInsert {
    return {
      name: serviceData.name,
      category: serviceData.category,
      description: serviceData.description || null,
      duration_minutes: serviceData.durationMinutes,
      price: serviceData.price,
      active: serviceData.active ?? true
    };
  }

  /**
   * Transform UpdateServiceData to Supabase update format
   */
  static toSupabaseUpdate(serviceData: UpdateServiceData): SupabaseServiceUpdate {
    const updateData: SupabaseServiceUpdate = {};

    // Only include fields that are provided
    if (serviceData.name !== undefined) updateData.name = serviceData.name;
    if (serviceData.category !== undefined) updateData.category = serviceData.category;
    if (serviceData.description !== undefined) updateData.description = serviceData.description || null;
    if (serviceData.durationMinutes !== undefined) updateData.duration_minutes = serviceData.durationMinutes;
    if (serviceData.price !== undefined) updateData.price = serviceData.price;
    if (serviceData.active !== undefined) updateData.active = serviceData.active;

    return updateData;
  }
}

class ServiceService {
  /**
   * Fetch all services from database
   */
  async getAllServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;

      return data.map(ServiceTransformer.fromSupabase);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erro ao carregar serviços');
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: number): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return ServiceTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      toast.error('Erro ao carregar serviço');
      throw error;
    }
  }

  /**
   * Create a new service
   */
  async createService(serviceData: CreateServiceData): Promise<Service> {
    try {
      const insertData = ServiceTransformer.toSupabaseInsert(serviceData);

      const { data, error } = await supabase
        .from('services')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Serviço adicionado com sucesso!');

      return ServiceTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Erro ao adicionar serviço');
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  async updateService(serviceData: UpdateServiceData): Promise<Service> {
    try {
      const updateData = ServiceTransformer.toSupabaseUpdate(serviceData);

      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceData.id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Serviço atualizado com sucesso!');

      return ServiceTransformer.fromSupabase(data);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Erro ao atualizar serviço');
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(id: number): Promise<void> {
    try {
      console.log('🔄 Tentando deletar serviço com ID:', id);

      const { data, error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .select(); // Adicionar select para verificar se algo foi deletado

      if (error) {
        console.error('❌ Erro do Supabase ao deletar serviço:', error);
        throw error;
      }

      console.log('✅ Serviço deletado com sucesso. Dados retornados:', data);
      toast.success('Serviço removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao deletar serviço:', error);
      toast.error('Erro ao remover serviço');
      throw error;
    }
  }

  /**
   * Search services by term
   */
  async searchServices(searchTerm: string): Promise<Service[]> {
    try {
      if (!searchTerm.trim()) {
        return this.getAllServices();
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name');

      if (error) throw error;

      return data.map(ServiceTransformer.fromSupabase);
    } catch (error) {
      console.error('Error searching services:', error);
      toast.error('Erro ao buscar serviços');
      throw error;
    }
  }

  /**
   * Filter services by various criteria
   */
  async filterServices(filters: ServiceFilters): Promise<Service[]> {
    try {
      let query = supabase
        .from('services')
        .select('*');

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Apply active filter
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      // Apply price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (min !== undefined && !isNaN(min)) {
          query = query.gte('price', min);
        }
        if (max !== undefined && !isNaN(max)) {
          query = query.lte('price', max);
        }
      }

      // Apply duration filter
      if (filters.duration) {
        const [min, max] = filters.duration.split('-').map(Number);
        if (min !== undefined && !isNaN(min)) {
          query = query.gte('duration_minutes', min);
        }
        if (max !== undefined && !isNaN(max)) {
          query = query.lte('duration_minutes', max);
        }
      }

      const { data, error } = await query.order('name');

      if (error) throw error;

      return data.map(ServiceTransformer.fromSupabase);
    } catch (error) {
      console.error('Error filtering services:', error);
      toast.error('Erro ao filtrar serviços');
      throw error;
    }
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<ServiceStats> {
    try {
      // Get total services
      const { count: total, error: totalError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get active services
      const { count: active, error: activeError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      if (activeError) throw activeError;

      // Get services by category
      const { data: categoryData, error: categoryError } = await supabase
        .from('services')
        .select('category');

      if (categoryError) throw categoryError;

      const byCategory: Record<string, number> = {};
      categoryData?.forEach(service => {
        byCategory[service.category] = (byCategory[service.category] || 0) + 1;
      });

      // Get average price
      const { data: priceData, error: priceError } = await supabase
        .from('services')
        .select('price');

      if (priceError) throw priceError;

      const averagePrice = priceData && priceData.length > 0
        ? priceData.reduce((sum, service) => sum + service.price, 0) / priceData.length
        : 0;

      return {
        total: total || 0,
        active: active || 0,
        byCategory,
        averagePrice
      };
    } catch (error) {
      console.error('Error getting service stats:', error);
      toast.error('Erro ao carregar estatísticas');
      throw error;
    }
  }

  /**
   * Get active services only
   */
  async getActiveServices(): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      return data.map(ServiceTransformer.fromSupabase);
    } catch (error) {
      console.error('Error fetching active services:', error);
      toast.error('Erro ao carregar serviços ativos');
      throw error;
    }
  }

  /**
   * Validate service data
   */
  validateServiceData(data: CreateServiceData | UpdateServiceData): ValidationResult {
    const errors: string[] = [];

    // Validate required fields
    if (!data.name?.trim()) {
      errors.push('Nome do serviço é obrigatório');
    }

    if (!data.category?.trim()) {
      errors.push('Categoria é obrigatória');
    }

    if (data.durationMinutes !== undefined && data.durationMinutes <= 0) {
      errors.push('Duração deve ser maior que zero');
    }

    if (data.price !== undefined && data.price < 0) {
      errors.push('Preço não pode ser negativo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const serviceService = new ServiceService();
