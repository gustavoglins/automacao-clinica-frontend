import { supabase } from '@/lib/supabaseClient';
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
      const { data, error } = await supabase
        .from('clinic_address')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: true });

      if (error) {
        console.error('Erro ao buscar endereços:', error);
        throw new Error('Erro ao buscar endereços da clínica');
      }

      return (
        data?.map((item) => ({
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
        })) || []
      );
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
      const { data, error } = await supabase
        .from('clinic_address')
        .select('*')
        .eq('id', id)
        .eq('ativo', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Registro não encontrado
        }
        console.error('Erro ao buscar endereço:', error);
        throw new Error('Erro ao buscar endereço');
      }

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
    } catch (error) {
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
      const { data, error } = await supabase
        .from('clinic_address')
        .insert({
          logradouro: address.logradouro,
          numero: address.numero,
          complemento: address.complemento,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
          cep: address.cep,
          ponto_referencia: address.pontoReferencia,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar endereço:', error);
        throw new Error('Erro ao criar endereço da clínica');
      }

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
      const { data, error } = await supabase
        .from('clinic_address')
        .update({
          logradouro: address.logradouro,
          numero: address.numero,
          complemento: address.complemento,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
          cep: address.cep,
          ponto_referencia: address.pontoReferencia,
        })
        .eq('id', address.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar endereço:', error);
        throw new Error('Erro ao atualizar endereço da clínica');
      }

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
      const { data, error } = await supabase
        .from('clinic_address')
        .select('*')
        .eq('ativo', true)
        .order('criado_em', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Nenhum endereço encontrado
        }
        console.error('Erro ao buscar endereço:', error);
        throw new Error('Erro ao buscar endereço');
      }

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
    } catch (error) {
      console.error('Erro no serviço de endereços:', error);
      throw error;
    }
  },
};
