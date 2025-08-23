import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
import { webhookService, WebhookOperation } from './webhookService';
import { Closure } from '@/types/closure';

export const closureService = {
  // Buscar todos os fechamentos
  async getAllClosures(): Promise<Closure[]> {
    try {
      const data = await apiGet<Closure[]>('/api/closures');
      return data || [];
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
      const created = await apiPost<Closure>('/api/closures', closureData);
      await webhookService.notifyClosures(WebhookOperation.INSERT);
      return created;
    } catch (error) {
      console.error('Erro ao criar fechamento:', error);
      throw new Error('Não foi possível criar o fechamento');
    }
  },

  // Atualizar um fechamento
  async updateClosure(closureData: Closure): Promise<Closure> {
    try {
      const { id, created_at, ...updateData } = closureData;
      const updated = await apiPut<Closure>(`/api/closures/${id}`, updateData);
      await webhookService.notifyClosures(WebhookOperation.UPDATE);
      return updated;
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
      const data = await apiGet<Closure[]>(
        `/api/closures/range/search?from=${startDate}&to=${endDate}`
      );
      return data || [];
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
