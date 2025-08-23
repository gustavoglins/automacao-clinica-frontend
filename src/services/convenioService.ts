// Backend-only convenio service
import { toast } from 'sonner';
import { webhookService, WebhookOperation } from './webhookService';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
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
      const rows = await apiGet<SupabaseConvenio[]>('/api/convenios');
      return rows.map(ConvenioTransformer.fromSupabase);
    } catch (e) {
      console.error('Erro ao buscar convênios', e);
      toast.error('Erro ao carregar convênios');
      throw e;
    }
  }

  async getById(id: number): Promise<Convenio | null> {
    try {
      const row = await apiGet<SupabaseConvenio>(`/api/convenios/${id}`);
      return row ? ConvenioTransformer.fromSupabase(row) : null;
    } catch (e) {
      console.error('Erro ao buscar convênio', e);
      toast.error('Erro ao carregar convênio');
      throw e;
    }
  }

  async create(payload: CreateConvenioData): Promise<Convenio> {
    try {
      const insertData = ConvenioTransformer.toSupabaseInsert(payload);
      const created = await apiPost<SupabaseConvenio>(
        '/api/convenios',
        insertData
      );
      toast.success('Convênio cadastrado');
      await webhookService.notifyConvenios(WebhookOperation.INSERT);
      return ConvenioTransformer.fromSupabase(created);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err.response?.status === 409)
        toast.error('Já existe um convênio com este nome');
      else toast.error('Erro ao cadastrar convênio');
      throw err;
    }
  }

  async update(payload: UpdateConvenioData): Promise<Convenio> {
    try {
      const updateData = ConvenioTransformer.toSupabaseUpdate(payload);
      const updated = await apiPut<SupabaseConvenio>(
        `/api/convenios/${payload.id}`,
        updateData
      );
      toast.success('Convênio atualizado');
      await webhookService.notifyConvenios(WebhookOperation.UPDATE);
      return ConvenioTransformer.fromSupabase(updated);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err.response?.status === 409)
        toast.error('Nome de convênio já existente');
      else toast.error('Erro ao atualizar convênio');
      throw err;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiDelete(`/api/convenios/${id}`);
      toast.success('Convênio removido');
      await webhookService.notifyConvenios(WebhookOperation.DELETE, id);
    } catch (e) {
      console.error('Erro ao remover convênio', e);
      toast.error('Erro ao remover convênio');
      throw e;
    }
  }

  async search(term: string): Promise<Convenio[]> {
    const all = await this.getAll();
    const t = term.trim().toLowerCase();
    if (!t) return all;
    return all.filter((c) => c.nome.toLowerCase().includes(t));
  }

  async filter(filters: ConvenioFilters): Promise<Convenio[]> {
    const all = await this.getAll();
    return all.filter((c) => {
      if (
        filters.search &&
        !c.nome.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (
        filters.abrangencia &&
        !c.abrangencia
          ?.toLowerCase()
          .includes(filters.abrangencia.toLowerCase())
      )
        return false;
      if (filters.tipo_cobertura && c.tipo_cobertura !== filters.tipo_cobertura)
        return false;
      if (filters.ativo !== undefined && c.ativo !== filters.ativo)
        return false;
      return true;
    });
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
