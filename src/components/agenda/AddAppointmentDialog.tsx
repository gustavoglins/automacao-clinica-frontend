import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
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
  Phone,
  CalendarPlus,
} from "lucide-react";
import { cn, formatPhone, onlyNumbers } from "@/lib/utils";
import { patientService } from "@/services/patientService";
import { employeeService } from "@/services/employeeService";
import { serviceService } from "@/services/servicesService";
import { CreateAppointmentData } from "@/types/appointment";

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAppointment: (appointment: CreateAppointmentData) => void;
  initialPatientId?: string;
  initialPhone?: string;
}

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const durations = [
  { value: "30min", label: "30 minutos" },
  { value: "1h", label: "1 hora" },
  { value: "1h30min", label: "1h 30min" },
  { value: "2h", label: "2 horas" },
];

export const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  open,
  onOpenChange,
  onAddAppointment,
  initialPatientId,
  initialPhone,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: initialPatientId || "",
    employeeId: "",
    serviceId: "",
    phone: initialPhone || "",
    date: undefined as Date | undefined,
    time: "",
    notes: "",
  });

  // Fallback para abrir dialogs via window ou via callback/context
  function openDialog(eventName: string, fallback?: () => void) {
    let dispatched = false;
    try {
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent(eventName));
        dispatched = true;
      }
    } catch (e) {
      dispatched = false;
    }
    if (!dispatched && typeof fallback === "function") {
      fallback();
    }
  }

  // Atualiza formData se initialPatientId/initialPhone mudarem (ex: ao abrir para outro paciente)
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      patientId: initialPatientId || "",
      phone: initialPhone || "",
    }));
  }, [initialPatientId, initialPhone, open]);

  const [patients, setPatients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [patientsData, employeesData, servicesData] = await Promise.all([
        patientService.getAllPatients(),
        employeeService.getAllEmployees(),
        serviceService.getAllServices(),
      ]);
      setPatients(patientsData);
      setEmployees(employeesData);
      setServices(servicesData);
    }

    if (open) {
      fetchData();
    }

    // Listener para recarregar dados quando solicitado via evento
    const handleRefreshData = () => {
      fetchData();
    };

    // Listeners para selecionar automaticamente itens recém-criados
    const handleNewPatientCreated = (event: CustomEvent) => {
      fetchData().then(() => {
        const newPatientId = event.detail?.patientId;
        if (newPatientId) {
          setFormData((prev) => ({ ...prev, patientId: newPatientId }));
        }
      });
    };

    const handleNewEmployeeCreated = (event: CustomEvent) => {
      fetchData().then(() => {
        const newEmployeeId = event.detail?.employeeId;
        if (newEmployeeId) {
          setFormData((prev) => ({ ...prev, employeeId: newEmployeeId }));
        }
      });
    };

    const handleNewServiceCreated = (event: CustomEvent) => {
      fetchData().then(() => {
        const newServiceId = event.detail?.serviceId;
        if (newServiceId) {
          setFormData((prev) => ({
            ...prev,
            serviceId: newServiceId.toString(),
          }));
        }
      });
    };

    window.addEventListener("refreshAppointmentDialogData", handleRefreshData);
    window.addEventListener(
      "newPatientCreated",
      handleNewPatientCreated as EventListener
    );
    window.addEventListener(
      "newEmployeeCreated",
      handleNewEmployeeCreated as EventListener
    );
    window.addEventListener(
      "newServiceCreated",
      handleNewServiceCreated as EventListener
    );

    return () => {
      window.removeEventListener(
        "refreshAppointmentDialogData",
        handleRefreshData
      );
      window.removeEventListener(
        "newPatientCreated",
        handleNewPatientCreated as EventListener
      );
      window.removeEventListener(
        "newEmployeeCreated",
        handleNewEmployeeCreated as EventListener
      );
      window.removeEventListener(
        "newServiceCreated",
        handleNewServiceCreated as EventListener
      );
    };
  }, [open]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientId ||
      !formData.employeeId ||
      !formData.serviceId ||
      !formData.phone ||
      !formData.date ||
      !formData.time
    ) {
      return;
    }

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

      const appointment: CreateAppointmentData = {
        patientId: formData.patientId,
        employeeId: formData.employeeId,
        serviceId: Number(formData.serviceId),
        appointmentAt: startDate.toISOString(),
        appointmentEnd: endDate.toISOString(),
        status: "agendada",
      };

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula delay da API
      onAddAppointment(appointment);
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patientId: "",
      employeeId: "",
      serviceId: "",
      phone: "",
      date: undefined,
      time: "",
      notes: "",
    });
    onOpenChange(false);
  };

  const isFormValid =
    formData.patientId &&
    formData.employeeId &&
    formData.serviceId &&
    formData.phone &&
    formData.date &&
    formData.time;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarPlus className="w-5 h-5 text-primary" />
            Nova Consulta
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para agendar uma nova consulta
          </DialogDescription>
        </DialogHeader>

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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between w-full">
                    <Label htmlFor="patientId">Paciente *</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="text-primary underline p-0 h-auto min-h-0"
                      onClick={() => openDialog("openAddPatientDialog")}
                    >
                      Novo Paciente
                    </Button>
                  </div>
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

                <div className="flex flex-col gap-2 justify-end h-full">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    readOnly
                    value={formatPhone(formData.phone)}
                    onChange={(e) => {
                      // Permite apenas números, mas exibe formatado
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
                  <div className="flex items-center justify-between w-full">
                    <Label htmlFor="serviceId">Serviço *</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="text-primary underline p-0 h-auto min-h-0"
                      onClick={() => openDialog("openAddServiceDialog")}
                    >
                      Novo Serviço
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between w-full">
                    <Label htmlFor="employeeId">Profissional *</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      className="text-primary underline p-0 h-auto min-h-0"
                      onClick={() => openDialog("openAddEmployeeDialog")}
                    >
                      Novo Profissional
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
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
                          return (
                            date.getFullYear() < now.getFullYear() ||
                            (date.getFullYear() === now.getFullYear() &&
                              date.getMonth() < now.getMonth()) ||
                            (date.getFullYear() === now.getFullYear() &&
                              date.getMonth() === now.getMonth() &&
                              date.getDate() < now.getDate())
                          );
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
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
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
                  Agendando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Agendar Consulta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
