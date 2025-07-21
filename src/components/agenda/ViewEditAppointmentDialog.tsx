import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, User, Stethoscope, FileText, Check, X, CalendarPlus } from "lucide-react";
import { cn, formatPhone, onlyNumbers } from "@/lib/utils";
import { Appointment, UpdateAppointmentData } from "@/types/appointment";

interface ViewEditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patients: Array<{ id: string; fullName: string; phone?: string }>; // minimal patient info
  employees: Array<{ id: string; fullName: string }>; // minimal employee info
  services: Array<{ id: number; name: string; durationMinutes?: number }>; // minimal service info
  onSave: (data: UpdateAppointmentData) => Promise<void>;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

const durations = [
  { value: "30min", label: "30 minutos" },
  { value: "1h", label: "1 hora" },
  { value: "1h30min", label: "1h 30min" },
  { value: "2h", label: "2 horas" },
];

export const ViewEditAppointmentDialog: React.FC<ViewEditAppointmentDialogProps> = ({
  open,
  onOpenChange,
  appointment,
  patients,
  employees,
  services,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || "",
    employeeId: appointment?.employeeId || "",
    serviceId: appointment?.serviceId?.toString() || "",
    phone: appointment?.patient?.phone || "",
    date: appointment ? new Date(appointment.appointmentAt) : undefined,
    time: appointment ? format(new Date(appointment.appointmentAt), "HH:mm") : "",
    duration: appointment?.service?.durationMinutes === 60 ? "1h" : appointment?.service?.durationMinutes === 90 ? "1h30min" : appointment?.service?.durationMinutes === 120 ? "2h" : "30min",
    notes: "",
    status: appointment?.status || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId || "",
        employeeId: appointment.employeeId || "",
        serviceId: appointment.serviceId?.toString() || "",
        phone: appointment.patient?.phone || "",
        date: appointment ? new Date(appointment.appointmentAt) : undefined,
        time: appointment ? format(new Date(appointment.appointmentAt), "HH:mm") : "",
        duration: appointment?.service?.durationMinutes === 60 ? "1h" : appointment?.service?.durationMinutes === 90 ? "1h30min" : appointment?.service?.durationMinutes === 120 ? "2h" : "30min",
        notes: "",
        status: appointment.status || "",
      });
    }
  }, [appointment]);

  const isFormValid = formData.patientId && formData.employeeId && formData.serviceId && formData.phone && formData.date && formData.time && formData.duration;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    setIsLoading(true);
    try {
      // Monta appointmentAt e appointmentEnd
      const [hour, minute] = formData.time.split(":");
      const startDate = new Date(formData.date!);
      startDate.setHours(Number(hour), Number(minute), 0, 0);
      let durationMinutes = 30;
      if (formData.duration === "1h") durationMinutes = 60;
      else if (formData.duration === "1h30min") durationMinutes = 90;
      else if (formData.duration === "2h") durationMinutes = 120;
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
      await onSave({
        id: appointment.id,
        patientId: formData.patientId,
        employeeId: formData.employeeId,
        serviceId: Number(formData.serviceId),
        appointmentAt: startDate.toISOString(),
        appointmentEnd: endDate.toISOString(),
        status: formData.status,
        // notes: formData.notes, // Uncomment if notes are supported in UpdateAppointmentData
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
                    <Select value={formData.patientId} onValueChange={async (value) => {
                      const selected = patients.find((p) => p.id === value);
                      setFormData({ ...formData, patientId: value, phone: selected?.phone || "" });
                    }}>
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
                    <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Profissional *</Label>
                    <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data da Consulta *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => setFormData({ ...formData, date })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração *</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Duração" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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