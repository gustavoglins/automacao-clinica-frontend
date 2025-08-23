import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
import { webhookService, WebhookOperation } from './webhookService';
import { Closure } from '@/types/closure';

export const closureService = {
  // Buscar todos os fechamentos
  async getAllClosures(): Promise<Closure[]> {
    try {
      const data = await apiGet<BackendClosureDto[]>('/api/closures');
      return (data || []).map(mapFromBackend);
    } catch (error) {
      console.error('Erro ao buscar fechamentos:', error);
      throw new Error('Não foi possível carregar os fechamentos');
    }
  },

  // Criar um novo fechamento
  async createClosure(
    closureData: Omit<Closure, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Closure> {
    try {
      const payload = mapToBackend(closureData);
      const created = await apiPost<BackendClosureDto>(
        '/api/closures',
        payload
      );
      await webhookService.notifyClosures(WebhookOperation.INSERT);
      return mapFromBackend(created);
    } catch (error) {
      console.error('Erro ao criar fechamento:', error);
      throw new Error('Não foi possível criar o fechamento');
    }
  },

  // Atualizar um fechamento
  async updateClosure(closureData: Closure): Promise<Closure> {
    try {
      const { id, created_at, ...rest } = closureData;
      const payload = mapToBackend(
        rest as Omit<Closure, 'id' | 'created_at' | 'updated_at'>
      );
      const updated = await apiPut<BackendClosureDto>(
        `/api/closures/${id}`,
        payload
      );
      await webhookService.notifyClosures(WebhookOperation.UPDATE);
      return mapFromBackend(updated);
    } catch (error) {
      console.error('Erro ao atualizar fechamento:', error);
      throw new Error('Não foi possível atualizar o fechamento');
    }
  },

  // Deletar um fechamento
  async deleteClosure(id: string): Promise<void> {
    try {
      await apiDelete(`/api/closures/${id}`);
      await webhookService.notifyClosures(WebhookOperation.DELETE, id);
    } catch (error) {
      console.error('Erro ao deletar fechamento:', error);
      throw new Error('Não foi possível deletar o fechamento');
    }
  },

  // Buscar fechamentos por data
  async getClosuresByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Closure[]> {
    try {
      const data = await apiGet<BackendClosureDto[]>(
        `/api/closures/range/search?from=${startDate}&to=${endDate}`
      );
      return (data || []).map(mapFromBackend);
    } catch (error) {
      console.error('Erro ao buscar fechamentos por data:', error);
      throw new Error('Não foi possível carregar os fechamentos');
    }
  },

  // Verificar se existe conflito de datas
  async checkDateConflict(
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      // Buscar fechamentos que intersectam (usar range search amplo)
      const list = await this.getClosuresByDateRange(startDate, endDate);
      return list.some((c) => c.id !== excludeId);
    } catch (error) {
      console.error('Erro ao verificar conflito de datas:', error);
      return false;
    }
  },
};

// Mapping helpers backend <-> frontend
interface BackendClosureDto {
  id: string;
  start_date: string;
  end_date: string;
  name?: string;
  description?: string | null;
  type?: string;
  is_recurring?: boolean;
  reason?: string; // legacy
  notes?: string | null; // legacy
  created_at?: string;
  updated_at?: string;
  criado_em?: string;
  atualizado_em?: string;
}

function mapFromBackend(row: BackendClosureDto): Closure {
  return {
    id: row.id,
    name: row.name || row.reason || 'Fechamento',
    description: row.description || row.notes || undefined,
    start_date: row.start_date,
    end_date: row.end_date,
    type: ((): Closure['type'] => {
      const allowed: Closure['type'][] = [
        'feriado',
        'férias',
        'recesso',
        'manutenção',
        'treinamento',
        'evento',
        'outro',
      ];
      if (row.type && allowed.includes(row.type as Closure['type'])) {
        return row.type as Closure['type'];
      }
      return 'outro';
    })(),
    is_recurring: !!row.is_recurring,
    created_at: row.created_at || row.criado_em || new Date().toISOString(),
    updated_at: row.updated_at || row.atualizado_em,
  };
}

function mapToBackend(
  row: Omit<Closure, 'id' | 'created_at' | 'updated_at'>
): Partial<BackendClosureDto> {
  return {
    start_date: row.start_date,
    end_date: row.end_date,
    name: row.name,
    description: row.description || null,
    type: row.type,
    is_recurring: row.is_recurring,
  };
}
