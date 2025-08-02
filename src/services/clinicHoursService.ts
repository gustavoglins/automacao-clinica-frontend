import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type {
  ClinicHours,
  CreateClinicHoursData,
  UpdateClinicHoursData,
  DayOfWeek,
} from "@/types/clinicHours";

interface SupabaseClinicHours {
  id: number;
  day_of_week: string;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
}

function transformFromSupabase(data: SupabaseClinicHours): ClinicHours {
  return {
    id: data.id,
    dayOfWeek: data.day_of_week,
    openTime: data.open_time,
    closeTime: data.close_time,
    isOpen: data.is_open,
  };
}

function transformToSupabase(
  data: CreateClinicHoursData
): Omit<SupabaseClinicHours, "id"> {
  return {
    day_of_week: data.dayOfWeek,
    open_time: data.openTime,
    close_time: data.closeTime,
    is_open: data.isOpen,
  };
}

export const clinicHoursService = {
  // Buscar todos os horários de funcionamento
  async getAllClinicHours(): Promise<ClinicHours[]> {
    try {
      const { data, error } = await supabase
        .from("clinic_hours")
        .select("*")
        .order("id");

      if (error) {
        console.error("Erro ao buscar horários de funcionamento:", error);
        toast.error("Erro ao carregar horários de funcionamento");
        return [];
      }

      return data.map(transformFromSupabase);
    } catch (error) {
      console.error("Erro ao buscar horários de funcionamento:", error);
      toast.error("Erro ao carregar horários de funcionamento");
      return [];
    }
  },

  // Buscar horário de funcionamento por dia da semana
  async getClinicHoursByDay(dayOfWeek: string): Promise<ClinicHours | null> {
    try {
      const { data, error } = await supabase
        .from("clinic_hours")
        .select("*")
        .eq("day_of_week", dayOfWeek)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Não encontrado
        }
        console.error("Erro ao buscar horário de funcionamento:", error);
        toast.error("Erro ao carregar horário de funcionamento");
        return null;
      }

      return transformFromSupabase(data);
    } catch (error) {
      console.error("Erro ao buscar horário de funcionamento:", error);
      toast.error("Erro ao carregar horário de funcionamento");
      return null;
    }
  },

  // Criar ou atualizar horário de funcionamento
  async upsertClinicHours(
    dayOfWeek: string,
    hoursData: Omit<CreateClinicHoursData, "dayOfWeek">
  ): Promise<ClinicHours | null> {
    try {
      const dataToUpsert = transformToSupabase({
        dayOfWeek,
        ...hoursData,
      });

      const { data, error } = await supabase
        .from("clinic_hours")
        .upsert(dataToUpsert, {
          onConflict: "day_of_week",
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar horário de funcionamento:", error);
        toast.error("Erro ao salvar horário de funcionamento");
        return null;
      }

      toast.success("Horário de funcionamento salvo com sucesso!");
      return transformFromSupabase(data);
    } catch (error) {
      console.error("Erro ao salvar horário de funcionamento:", error);
      toast.error("Erro ao salvar horário de funcionamento");
      return null;
    }
  },

  // Atualizar horário de funcionamento
  async updateClinicHours(
    id: number,
    hoursData: UpdateClinicHoursData
  ): Promise<ClinicHours | null> {
    try {
      const updateData: Partial<SupabaseClinicHours> = {};

      if (hoursData.openTime !== undefined)
        updateData.open_time = hoursData.openTime;
      if (hoursData.closeTime !== undefined)
        updateData.close_time = hoursData.closeTime;
      if (hoursData.isOpen !== undefined) updateData.is_open = hoursData.isOpen;

      const { data, error } = await supabase
        .from("clinic_hours")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar horário de funcionamento:", error);
        toast.error("Erro ao atualizar horário de funcionamento");
        return null;
      }

      toast.success("Horário de funcionamento atualizado com sucesso!");
      return transformFromSupabase(data);
    } catch (error) {
      console.error("Erro ao atualizar horário de funcionamento:", error);
      toast.error("Erro ao atualizar horário de funcionamento");
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

    const [openHour, openMinute] = openTime.split(":").map(Number);
    const [closeHour, closeMinute] = closeTime.split(":").map(Number);

    const openDate = new Date();
    openDate.setHours(openHour, openMinute, 0, 0);

    const closeDate = new Date();
    closeDate.setHours(closeHour, closeMinute, 0, 0);

    const current = new Date(openDate);

    while (current < closeDate) {
      const hours = current.getHours().toString().padStart(2, "0");
      const minutes = current.getMinutes().toString().padStart(2, "0");
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
