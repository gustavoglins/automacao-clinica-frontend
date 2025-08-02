import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  Check,
  X,
  CalendarPlus,
} from "lucide-react";
import { cn, formatPhone, onlyNumbers, getDayOfWeek } from "@/lib/utils";
import { Appointment, UpdateAppointmentData } from "@/types/appointment";
import { clinicHoursService } from "@/services/clinicHoursService";
import { ClinicHours } from "@/types/clinicHours";

interface ViewEditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patients: Array<{ id: string; fullName: string; phone?: string }>; // minimal patient info
  employees: Array<{ id: string; fullName: string }>; // minimal employee info
  services: Array<{ id: number; name: string; durationMinutes?: number }>; // minimal service info
  onSave: (data: UpdateAppointmentData) => Promise<void>;
}

export const ViewEditAppointmentDialog: React.FC<
  ViewEditAppointmentDialogProps
> = ({
  open,
  onOpenChange,
  appointment,
  patients,
  employees,
  services,
  onSave,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [clinicHours, setClinicHours] = useState<ClinicHours[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || "",
    employeeId: appointment?.employeeId || "",
    serviceId: appointment?.serviceId?.toString() || "",
    phone: appointment?.patient?.phone || "",
    date: appointment ? new Date(appointment.appointmentAt) : undefined,
    time: appointment
      ? format(new Date(appointment.appointmentAt), "HH:mm")
      : "",
    notes: "",
    status: appointment?.status || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar horários de funcionamento da clínica
  useEffect(() => {
    async function fetchClinicHours() {
      if (open) {
        const clinicHoursData = await clinicHoursService.getAllClinicHours();
        setClinicHours(clinicHoursData);
      }
    }
    fetchClinicHours();
  }, [open]);

  // Efeito para carregar horários disponíveis quando a data muda
  useEffect(() => {
    async function loadAvailableTimeSlots() {
      if (formData.date) {
        const dayOfWeek = getDayOfWeek(formData.date);
        const timeSlots = await clinicHoursService.getAvailableTimeSlotsForDay(
          dayOfWeek
        );
        setAvailableTimeSlots(timeSlots);

        // Limpar horário selecionado se não estiver mais disponível
        if (formData.time && !timeSlots.includes(formData.time)) {
          setFormData((prev) => ({ ...prev, time: "" }));
        }
      } else {
        setAvailableTimeSlots([]);
      }
    }

    loadAvailableTimeSlots();
  }, [formData.date, formData.time]);

  useEffect(() => {
    async function loadAvailableTimeSlots() {
      if (formData.date) {
        const dayOfWeek = getDayOfWeek(formData.date);
        const timeSlots = await clinicHoursService.getAvailableTimeSlotsForDay(
          dayOfWeek
        );
        setAvailableTimeSlots(timeSlots);

        // Limpar horário selecionado se não estiver mais disponível
        if (formData.time && !timeSlots.includes(formData.time)) {
          setFormData((prev) => ({ ...prev, time: "" }));
        }
      } else {
        setAvailableTimeSlots([]);
      }
    }

    loadAvailableTimeSlots();
  }, [formData.date, formData.time]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || "",
        employeeId: appointment.employeeId || "",
        serviceId: appointment.serviceId?.toString() || "",
        phone: appointment.patient?.phone || "",
        date: appointment ? new Date(appointment.appointmentAt) : undefined,
        time: appointment
          ? format(new Date(appointment.appointmentAt), "HH:mm")
          : "",
        notes: "",
        status: appointment.status || "",
      });
    }
  }, [appointment]);

  const isFormValid =
    formData.patientId &&
    formData.employeeId &&
    formData.serviceId &&
    formData.phone &&
    formData.date &&
    formData.time;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    setIsLoading(true);
    try {
      // Monta appointmentAt e appointmentEnd
      const [hour, minute] = formData.time.split(":");
      const startDate = new Date(formData.date!);
      startDate.setHours(Number(hour), Number(minute), 0, 0);

      // Buscar duração do serviço selecionado
      const selectedService = services.find(
        (s) => s.id.toString() === formData.serviceId
      );
      const durationMinutes = selectedService?.durationMinutes || 30;
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

      await onSave({
        id: appointment.id,
        patientId: formData.patientId,
        employeeId: formData.employeeId,
        serviceId: Number(formData.serviceId),
        appointmentAt: startDate.toISOString(),
        appointmentEnd: endDate.toISOString(),
        status: formData.status,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarPlus className="w-5 h-5 text-primary" />
            Detalhes da Consulta
          </DialogTitle>
          <DialogDescription>
            Visualize e edite as informações da consulta
          </DialogDescription>
        </DialogHeader>
        {appointment && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Informações do Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Informações do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Paciente *</Label>
                    <Select
                      value={formData.patientId}
                      onValueChange={async (value) => {
                        const selected = patients.find((p) => p.id === value);
                        setFormData({
                          ...formData,
                          patientId: value,
                          phone: selected?.phone || "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={formatPhone(formData.phone)}
                      onChange={(e) => {
                        const raw = onlyNumbers(e.target.value);
                        setFormData({ ...formData, phone: raw });
                      }}
                      maxLength={15}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Informações da Consulta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Detalhes da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceId">Serviço *</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={service.id.toString()}
                          >
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Profissional *</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, employeeId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Data e Horário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  Data e Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data da Consulta *</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date
                            ? format(formData.date, "dd/MM/yyyy", {
                                locale: ptBR,
                              })
                            : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => {
                            setFormData({ ...formData, date });
                            if (date) setCalendarOpen(false);
                          }}
                          disabled={(date) => {
                            const now = new Date();
                            now.setHours(0, 0, 0, 0); // Normalizar para comparação de data apenas

                            // Desabilitar datas passadas
                            if (date < now) {
                              return true;
                            }

                            // Verificar se a clínica está aberta neste dia
                            const dayOfWeek = getDayOfWeek(date);
                            const clinicHour = clinicHours.find(
                              (ch) => ch.dayOfWeek === dayOfWeek
                            );

                            return !clinicHour?.isOpen;
                          }}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) =>
                        setFormData({ ...formData, time: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            {formData.date
                              ? "Nenhum horário disponível para esta data"
                              : "Selecione uma data primeiro"}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo de duração removido, duração será definida pelo serviço selecionado */}
                </div>
              </CardContent>
            </Card>
            {/* Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Adicionais</Label>
                  <Textarea
                    id="notes"
                    placeholder="Digite qualquer observação importante..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewEditAppointmentDialog;
