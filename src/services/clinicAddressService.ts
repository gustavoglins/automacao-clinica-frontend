// Backend-only clinic address service
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import { webhookService, WebhookOperation } from './webhookService';
import type {
  ClinicAddress,
  CreateClinicAddressInput,
  UpdateClinicAddressInput,
} from '@/types/clinicAddress';

export const clinicAddressService = {
  /**
   * Busca todos os endereços da clínica
   */
  async getAllAddresses(): Promise<ClinicAddress[]> {
    try {
      const data = await apiGet<ClinicAddressDto[]>('/api/clinic-address');
      return data
        .filter((d) => d.ativo)
        .map((item) => ({
          id: item.id,
          logradouro: item.logradouro,
          numero: item.numero,
          complemento: item.complemento,
          bairro: item.bairro,
          cidade: item.cidade,
          estado: item.estado,
          cep: item.cep,
          pontoReferencia: item.ponto_referencia,
          ativo: item.ativo,
          criadoEm: new Date(item.criado_em),
          atualizadoEm: new Date(item.atualizado_em),
        }));
    } catch (error) {
      console.error('Erro no serviço de endereços:', error);
      throw error;
    }
  },

  /**
   * Busca um endereço específico por ID
   */
  async getAddressById(id: string): Promise<ClinicAddress | null> {
    try {
      const data = await apiGet<ClinicAddressDto>(`/api/clinic-address/${id}`);
      if (!data || !data.ativo) return null;
      return {
        id: data.id,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        pontoReferencia: data.ponto_referencia,
        ativo: data.ativo,
        criadoEm: new Date(data.criado_em),
        atualizadoEm: new Date(data.atualizado_em),
      };
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return null;
      console.error('Erro no serviço de endereços:', error);
      throw error;
    }
  },

  /**
   * Cria um novo endereço da clínica
   */
  async createAddress(
    address: CreateClinicAddressInput
  ): Promise<ClinicAddress> {
    try {
      const created = await apiPost<ClinicAddressDto>('/api/clinic-address', {
        logradouro: address.logradouro,
        numero: address.numero,
        complemento: address.complemento,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado,
        cep: address.cep,
        ponto_referencia: address.pontoReferencia,
      });
      await webhookService.notifyClinicAddress(WebhookOperation.INSERT);
      return {
        id: created.id,
        logradouro: created.logradouro,
        numero: created.numero,
        complemento: created.complemento,
        bairro: created.bairro,
        cidade: created.cidade,
        estado: created.estado,
        cep: created.cep,
        pontoReferencia: created.ponto_referencia,
        ativo: created.ativo,
        criadoEm: new Date(created.criado_em),
        atualizadoEm: new Date(created.atualizado_em),
      };
    } catch (error) {
      console.error('Erro no serviço de endereços:', error);
      throw error;
    }
  },

  /**
   * Atualiza um endereço existente
   */
  async updateAddress(
    address: UpdateClinicAddressInput
  ): Promise<ClinicAddress> {
    try {
      const updated = await apiPut<ClinicAddressDto>(
        `/api/clinic-address/${address.id}`,
        {
          logradouro: address.logradouro,
          numero: address.numero,
          complemento: address.complemento,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
          cep: address.cep,
          ponto_referencia: address.pontoReferencia,
        }
      );
      await webhookService.notifyClinicAddress(WebhookOperation.UPDATE);
      return {
        id: updated.id,
        logradouro: updated.logradouro,
        numero: updated.numero,
        complemento: updated.complemento,
        bairro: updated.bairro,
        cidade: updated.cidade,
        estado: updated.estado,
        cep: updated.cep,
        pontoReferencia: updated.ponto_referencia,
        ativo: updated.ativo,
        criadoEm: new Date(updated.criado_em),
        atualizadoEm: new Date(updated.atualizado_em),
      };
    } catch (error) {
      console.error('Erro no serviço de endereços:', error);
      throw error;
    }
  },

  /**
   * Busca o primeiro endereço ativo da clínica
   */
  async getPrimaryAddress(): Promise<ClinicAddress | null> {
    try {
      const list = await this.getAllAddresses();
      return list[0] || null;
    } catch (error) {
      console.error('Erro no serviço de endereços:', error);
      throw error;
    }
  },
};

// Types
export interface ClinicAddressDto {
  id: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  ponto_referencia?: string | null;
  ativo: boolean;
  criado_em: string | Date;
  atualizado_em: string | Date;
}

export interface ClinicAddressCreateInput {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pontoReferencia?: string;
}

export interface ClinicAddressUpdateInput extends ClinicAddressCreateInput {
  id: string;
}
