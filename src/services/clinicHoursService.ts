// Backend-only implementation (removed Supabase usage)
import { apiGet, apiPut } from '@/lib/apiClient';
import { toast } from 'sonner';
import { webhookService, WebhookOperation } from './webhookService';
import type {
  ClinicHours,
  CreateClinicHoursData,
  UpdateClinicHoursData,
  DayOfWeek,
} from '@/types/clinicHours';

interface ClinicHoursDto {
  id: number;
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
}

function fromDto(data: ClinicHoursDto): ClinicHours {
  return {
    id: data.id,
    dayOfWeek: data.day_of_week,
    openTime: data.open_time,
    closeTime: data.close_time,
    isOpen: data.is_open,
  };
}

function toDtoPayload(data: CreateClinicHoursData) {
  return {
    open_time: data.openTime,
    close_time: data.closeTime,
    is_open: data.isOpen,
  };
}

export const clinicHoursService = {
  // Buscar todos os horários de funcionamento
  async getAllClinicHours(): Promise<ClinicHours[]> {
    try {
      const data = await apiGet<ClinicHoursDto[]>('/api/clinic-hours');
      return data.map(fromDto);
    } catch (error) {
      console.error('Erro ao buscar horários de funcionamento:', error);
      toast.error('Erro ao carregar horários de funcionamento');
      return [];
    }
  },

  // Buscar horário de funcionamento por dia da semana
  async getClinicHoursByDay(dayOfWeek: string): Promise<ClinicHours | null> {
    try {
      const data = await apiGet<ClinicHoursDto>(
        `/api/clinic-hours/${dayOfWeek}`
      );
      return data ? fromDto(data) : null;
    } catch (error) {
      console.error('Erro ao buscar horário de funcionamento:', error);
      toast.error('Erro ao carregar horário de funcionamento');
      return null;
    }
  },

  // Criar ou atualizar horário de funcionamento
  async upsertClinicHours(
    dayOfWeek: string,
    hoursData: Omit<CreateClinicHoursData, 'dayOfWeek'>
  ): Promise<ClinicHours | null> {
    try {
      const payload = toDtoPayload({ dayOfWeek, ...hoursData });
      const data = await apiPut<ClinicHoursDto>(
        `/api/clinic-hours/${dayOfWeek}`,
        payload
      );
      toast.success('Horário de funcionamento salvo com sucesso!');
      await webhookService.notifyClinicHours(WebhookOperation.UPDATE);
      return fromDto(data);
    } catch (error) {
      console.error('Erro ao salvar horário de funcionamento:', error);
      toast.error('Erro ao salvar horário de funcionamento');
      return null;
    }
  },

  // Criar ou atualizar horário de funcionamento (sem webhook - para uso em lote)
  async upsertClinicHoursWithoutWebhook(
    dayOfWeek: string,
    hoursData: Omit<CreateClinicHoursData, 'dayOfWeek'>
  ): Promise<ClinicHours | null> {
    try {
      const payload = toDtoPayload({ dayOfWeek, ...hoursData });
      const data = await apiPut<ClinicHoursDto>(
        `/api/clinic-hours/${dayOfWeek}`,
        payload
      );
      return fromDto(data);
    } catch (error) {
      console.error('Erro ao salvar horário de funcionamento:', error);
      return null;
    }
  },

  // Salvar múltiplos horários de funcionamento em lote
  async saveMultipleClinicHours(
    hoursArray: Array<
      { dayOfWeek: string } & Omit<CreateClinicHoursData, 'dayOfWeek'>
    >
  ): Promise<boolean> {
    try {
      console.log('🔔 [DEBUG] Iniciando salvamento de horários múltiplos...');

      for (const hours of hoursArray) {
        console.log(
          `🔔 [DEBUG] Salvando horário para ${hours.dayOfWeek}:`,
          hours
        );

        const result = await this.upsertClinicHoursWithoutWebhook(
          hours.dayOfWeek,
          {
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isOpen: hours.isOpen,
          }
        );

        if (!result) {
          console.error(
            `❌ [DEBUG] Falha ao salvar horário para ${hours.dayOfWeek}`
          );
        } else {
          console.log(
            `✅ [DEBUG] Horário salvo com sucesso para ${hours.dayOfWeek}`
          );
        }
      }

      console.log('🔔 [DEBUG] Enviando notificação de webhook...');

      // SEMPRE enviar notificação de webhook, independente de sucesso individual
      await webhookService.notifyClinicHours(WebhookOperation.UPDATE);

      console.log('✅ [DEBUG] Webhook enviado com sucesso!');

      toast.success('Horários de funcionamento salvos com sucesso!');

      return true;
    } catch (error) {
      console.error(
        '❌ [DEBUG] Erro ao salvar horários de funcionamento:',
        error
      );
      toast.error('Erro ao salvar horários de funcionamento');

      // Mesmo com erro, tentar enviar webhook
      try {
        await webhookService.notifyClinicHours(WebhookOperation.UPDATE);
        console.log('🔔 [DEBUG] Webhook enviado mesmo com erro no salvamento');
      } catch (webhookError) {
        console.error('❌ [DEBUG] Erro ao enviar webhook:', webhookError);
      }

      return false;
    }
  },

  // Atualizar horário de funcionamento
  async updateClinicHours(
    id: number,
    hoursData: UpdateClinicHoursData
  ): Promise<ClinicHours | null> {
    try {
      // Como o backend atualiza por dia, precisamos descobrir o dia a partir do id
      const all = await this.getAllClinicHours();
      const record = all.find((h) => h.id === id);
      if (!record) {
        toast.error('Horário não encontrado');
        return null;
      }
      const payload: Partial<{
        open_time: string | null;
        close_time: string | null;
        is_open: boolean;
      }> = {};
      if (hoursData.openTime !== undefined)
        payload.open_time = hoursData.openTime;
      if (hoursData.closeTime !== undefined)
        payload.close_time = hoursData.closeTime;
      if (hoursData.isOpen !== undefined) payload.is_open = hoursData.isOpen;
      const data = await apiPut<ClinicHoursDto>(
        `/api/clinic-hours/${record.dayOfWeek}`,
        payload
      );
      toast.success('Horário de funcionamento atualizado com sucesso!');
      await webhookService.notifyClinicHours(WebhookOperation.UPDATE);
      return fromDto(data);
    } catch (error) {
      console.error('Erro ao atualizar horário de funcionamento:', error);
      toast.error('Erro ao atualizar horário de funcionamento');
      return null;
    }
  },

  // Gerar horários disponíveis para um dia específico
  generateTimeSlots(
    openTime: string,
    closeTime: string,
    intervalMinutes: number = 30
  ): string[] {
    const timeSlots: string[] = [];

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const openDate = new Date();
    openDate.setHours(openHour, openMinute, 0, 0);

    const closeDate = new Date();
    closeDate.setHours(closeHour, closeMinute, 0, 0);

    const current = new Date(openDate);

    while (current < closeDate) {
      const hours = current.getHours().toString().padStart(2, '0');
      const minutes = current.getMinutes().toString().padStart(2, '0');
      timeSlots.push(`${hours}:${minutes}`);

      current.setMinutes(current.getMinutes() + intervalMinutes);
    }

    return timeSlots;
  },

  // Verificar se a clínica está aberta em um dia específico
  async isOpenOnDay(dayOfWeek: string): Promise<boolean> {
    const clinicHours = await this.getClinicHoursByDay(dayOfWeek);
    return clinicHours?.isOpen || false;
  },

  // Obter horários disponíveis para um dia específico
  async getAvailableTimeSlotsForDay(dayOfWeek: string): Promise<string[]> {
    const clinicHours = await this.getClinicHoursByDay(dayOfWeek);

    if (
      !clinicHours ||
      !clinicHours.isOpen ||
      !clinicHours.openTime ||
      !clinicHours.closeTime
    ) {
      return [];
    }

    return this.generateTimeSlots(clinicHours.openTime, clinicHours.closeTime);
  },
};

export default clinicHoursService;
