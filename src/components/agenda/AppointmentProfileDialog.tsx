import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAppointmentStatusBadge } from "@/lib/badgeUtils";
import {
  CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  Edit,
  X,
  Trash,
} from "lucide-react";
// Função para capitalizar a primeira letra
function capitalizeFirstLetter(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
import { Appointment, UpdateAppointmentData } from "@/types/appointment";
import ViewEditAppointmentDialog from "./ViewEditAppointmentDialog";

interface AppointmentProfileDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  patients: Array<{ id: string; fullName: string; phone?: string }>;
  employees: Array<{ id: string; fullName: string }>;
  services: Array<{ id: number; name: string; durationMinutes?: number }>;
  onSave: (data: UpdateAppointmentData) => Promise<void>;
}

export const AppointmentProfileDialog: React.FC<
  AppointmentProfileDialogProps
> = ({ appointment, open, onClose, patients, employees, services, onSave }) => {
  const [editMode, setEditMode] = useState(false);

  if (!appointment) return null;

  const statusBadge = getAppointmentStatusBadge(appointment.status);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden">
        <DialogHeader className="px-6 py-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Detalhes da Consulta
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="px-6 py-6 space-y-6">
          {!editMode ? (
            <>
              {/* Header */}
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl shadow-lg">
                  <User className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                    {appointment.patient?.fullName || "Paciente não encontrado"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge
                      variant={statusBadge.variant}
                      className={statusBadge.className}
                    >
                      {capitalizeFirstLetter(appointment.status)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                      {appointment.service?.name || "Serviço"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      Profissional:{" "}
                      <span className="font-medium text-gray-900">
                        {appointment.employee?.fullName || "-"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setEditMode(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Consulta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 text-red-600 border-red-200 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Tem certeza que deseja deletar esta consulta?"
                      )
                    ) {
                      // TODO: Adicionar lógica de deleção aqui
                    }
                  }}
                  title="Deletar Consulta"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
              <Separator />
              {/* Detalhes da Consulta */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    Data e Horário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <span>
                      {capitalizeFirstLetter(
                        formatDate(appointment.appointmentAt)
                      )}
                    </span>
                    <span>às</span>
                    <span>
                      {formatTime(appointment.appointmentAt)} -{" "}
                      {formatTime(appointment.appointmentEnd)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">Duração:</span>{" "}
                    {appointment.service?.durationMinutes || 30} min
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-lg font-medium text-gray-900">
                    {appointment.service?.name || "-"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Valor:</span> R${" "}
                    {appointment.service?.price?.toFixed(2) || "-"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-lg font-medium text-gray-900">
                    {appointment.patient?.fullName || "-"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Telefone:</span>{" "}
                    {appointment.patient?.phone || "-"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Email:</span>{" "}
                    {appointment.patient?.email || "-"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-lg font-medium text-gray-900">
                    {appointment.employee?.fullName || "-"}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Cargo:</span>{" "}
                    {appointment.employee?.role
                      ? capitalizeFirstLetter(appointment.employee.role)
                      : "-"}
                  </div>
                  {appointment.employee && appointment.employee.specialty && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Especialidade:</span>{" "}
                      {appointment.employee.specialty}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Observações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed min-h-[40px]">
                    Nenhuma observação registrada.
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <ViewEditAppointmentDialog
              open={editMode}
              onOpenChange={(open) => {
                setEditMode(open);
                if (!open) onClose();
              }}
              appointment={appointment}
              patients={patients}
              employees={employees}
              services={services}
              onSave={async (data) => {
                await onSave(data);
                setEditMode(false);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentProfileDialog;
