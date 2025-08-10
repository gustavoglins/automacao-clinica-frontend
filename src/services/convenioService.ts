import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type {
  Convenio,
  CreateConvenioData,
  UpdateConvenioData,
  SupabaseConvenio,
  SupabaseConvenioInsert,
  SupabaseConvenioUpdate,
  ConvenioFilters,
  ValidationResult,
} from '@/types/convenio';

class ConvenioTransformer {
  static fromSupabase(data: SupabaseConvenio): Convenio {
    return { ...data };
  }

  static toSupabaseInsert(data: CreateConvenioData): SupabaseConvenioInsert {
    return {
      nome: data.nome,
      abrangencia: data.abrangencia,
      tipo_cobertura: data.tipo_cobertura,
      telefone_contato: data.telefone_contato || null,
      email_contato: data.email_contato || null,
      observacoes: data.observacoes || null,
      ativo: data.ativo ?? true,
    };
  }

  static toSupabaseUpdate(data: UpdateConvenioData): SupabaseConvenioUpdate {
    const out: SupabaseConvenioUpdate = {};
    if (data.nome !== undefined) out.nome = data.nome;
    if (data.abrangencia !== undefined) out.abrangencia = data.abrangencia;
    if (data.tipo_cobertura !== undefined)
      out.tipo_cobertura = data.tipo_cobertura;
    if (data.telefone_contato !== undefined)
      out.telefone_contato = data.telefone_contato || null;
    if (data.email_contato !== undefined)
      out.email_contato = data.email_contato || null;
    if (data.observacoes !== undefined)
      out.observacoes = data.observacoes || null;
    if (data.ativo !== undefined) out.ativo = data.ativo;
    return out;
  }
}

class ConvenioService {
  async getAll(): Promise<Convenio[]> {
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('*')
        .order('nome');
      if (error) throw error;
      return (data || []).map(ConvenioTransformer.fromSupabase);
    } catch (e) {
      console.error('Erro ao buscar convênios', e);
      toast.error('Erro ao carregar convênios');
      throw e;
    }
  }

  async getById(id: number): Promise<Convenio | null> {
    try {
      const { data, error } = await supabase
        .from('convenios')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data ? ConvenioTransformer.fromSupabase(data) : null;
    } catch (e) {
      console.error('Erro ao buscar convênio', e);
      toast.error('Erro ao carregar convênio');
      throw e;
    }
  }

  async create(payload: CreateConvenioData): Promise<Convenio> {
    try {
      const insertData = ConvenioTransformer.toSupabaseInsert(payload);
      const { data, error } = await supabase
        .from('convenios')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      toast.success('Convênio cadastrado com sucesso');
      return ConvenioTransformer.fromSupabase(data);
    } catch (e: unknown) {
      const err = e as { code?: string } | undefined;
      if (err?.code === '23505') {
        toast.error('Já existe um convênio com este nome');
      } else {
        toast.error('Erro ao cadastrar convênio');
      }
      throw e;
    }
  }

  async update(payload: UpdateConvenioData): Promise<Convenio> {
    try {
      const updateData = ConvenioTransformer.toSupabaseUpdate(payload);
      const { data, error } = await supabase
        .from('convenios')
        .update(updateData)
        .eq('id', payload.id)
        .select()
        .single();
      if (error) throw error;
      toast.success('Convênio atualizado com sucesso');
      return ConvenioTransformer.fromSupabase(data);
    } catch (e: unknown) {
      const err = e as { code?: string } | undefined;
      if (err?.code === '23505') {
        toast.error('Nome de convênio já existente');
      } else {
        toast.error('Erro ao atualizar convênio');
      }
      throw e;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase.from('convenios').delete().eq('id', id);
      if (error) throw error;
      toast.success('Convênio removido');
    } catch (e) {
      console.error('Erro ao remover convênio', e);
      toast.error('Erro ao remover convênio');
      throw e;
    }
  }

  async search(term: string): Promise<Convenio[]> {
    if (!term.trim()) return this.getAll();
    const { data, error } = await supabase
      .from('convenios')
      .select('*')
      .ilike('nome', `%${term}%`)
      .order('nome');
    if (error) {
      toast.error('Erro na busca');
      throw error;
    }
    return (data || []).map(ConvenioTransformer.fromSupabase);
  }

  async filter(filters: ConvenioFilters): Promise<Convenio[]> {
    let query = supabase.from('convenios').select('*');
    if (filters.search) {
      query = query.ilike('nome', `%${filters.search}%`);
    }
    if (filters.abrangencia) {
      query = query.ilike('abrangencia', `%${filters.abrangencia}%`);
    }
    if (filters.tipo_cobertura) {
      query = query.eq('tipo_cobertura', filters.tipo_cobertura);
    }
    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }
    const { data, error } = await query.order('nome');
    if (error) {
      toast.error('Erro ao filtrar convênios');
      throw error;
    }
    return (data || []).map(ConvenioTransformer.fromSupabase);
  }

  validate(data: CreateConvenioData | UpdateConvenioData): ValidationResult {
    const errors: string[] = [];
    if (!data.nome?.trim()) errors.push('Nome é obrigatório');
    if (!data.abrangencia?.trim()) errors.push('Abrangência é obrigatória');
    if (!data.tipo_cobertura?.trim())
      errors.push('Tipo de cobertura é obrigatório');
    return { isValid: errors.length === 0, errors };
  }
}

export const convenioService = new ConvenioService();
