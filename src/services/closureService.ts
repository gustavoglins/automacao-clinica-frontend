import { supabase } from '@/lib/supabaseClient';
import { Closure } from '@/types/closure';

export const closureService = {
  // Buscar todos os fechamentos
  async getAllClosures(): Promise<Closure[]> {
    const { data, error } = await supabase
      .from('clinic_closures')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar fechamentos:', error);
      throw new Error('Não foi possível carregar os fechamentos');
    }

    return data || [];
  },

  // Criar um novo fechamento
  async createClosure(
    closureData: Omit<Closure, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Closure> {
    const { data, error } = await supabase
      .from('clinic_closures')
      .insert([closureData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar fechamento:', error);
      throw new Error('Não foi possível criar o fechamento');
    }

    return data;
  },

  // Atualizar um fechamento
  async updateClosure(closureData: Closure): Promise<Closure> {
    const { id, created_at, ...updateData } = closureData;

    const { data, error } = await supabase
      .from('clinic_closures')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar fechamento:', error);
      throw new Error('Não foi possível atualizar o fechamento');
    }

    return data;
  },

  // Deletar um fechamento
  async deleteClosure(id: string): Promise<void> {
    const { error } = await supabase
      .from('clinic_closures')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar fechamento:', error);
      throw new Error('Não foi possível deletar o fechamento');
    }
  },

  // Buscar fechamentos por data
  async getClosuresByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Closure[]> {
    const { data, error } = await supabase
      .from('clinic_closures')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar fechamentos por data:', error);
      throw new Error('Não foi possível carregar os fechamentos');
    }

    return data || [];
  },

  // Verificar se existe conflito de datas
  async checkDateConflict(
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from('clinic_closures')
      .select('id')
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao verificar conflito de datas:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  },
};
