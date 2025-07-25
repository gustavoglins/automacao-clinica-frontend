import React from "react";
import { DataList } from "@/components/ui/data-list";
import { createFetchDataFromArray } from "@/lib/dataListUtils";
import { Appointment } from "@/types/appointment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Stethoscope, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentDataListProps {
  appointments: Appointment[];
  onViewAppointment?: (appointment: Appointment) => void;
  onAddNew?: () => void;
  pagination?: "paged" | "infinite";
  pageSize?: number;
  height?: string;
  viewMode?: "day" | "week" | "month";
}

export const AppointmentDataList: React.FC<AppointmentDataListProps> = ({
  appointments,
  onViewAppointment,
  onAddNew,
  pagination = "paged",
  pageSize = 6,
  height = "500px",
  viewMode = "day",
}) => {
  const fetchData = createFetchDataFromArray(appointments);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "reagendada":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      case "concluida":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmada":
        return "Confirmada";
      case "pendente":
        return "Pendente";
      case "reagendada":
        return "Reagendada";
      case "cancelada":
        return "Cancelada";
      case "concluida":
        return "Concluída";
      default:
        return status;
    }
  };

  const renderAppointmentItem = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.appointmentAt);
    const formattedDate = appointmentDate.toLocaleDateString("pt-BR");
    const formattedTime = appointmentDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Card
        key={appointment.id}
        className="hover:shadow-md transition-shadow cursor-pointer"
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">
                  {appointment.patient?.fullName || "Paciente não encontrado"}
                </h3>
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusLabel(appointment.status)}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4" />
                  <span>
                    {appointment.service?.name || "Serviço não encontrado"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>
                    {appointment.employee?.fullName ||
                      "Funcionário não encontrado"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formattedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button size="sm" variant="outline">
                Editar
              </Button>
              {appointment.status === "pendente" && (
                <Button size="sm" variant="default">
                  Confirmar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTitle = () => {
    switch (viewMode) {
      case "day":
        return "Consultas do Dia";
      case "week":
        return "Consultas da Semana";
      case "month":
        return "Consultas do Mês";
      default:
        return "Consultas Agendadas";
    }
  };

  const getDescription = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(
      (a) => a.status === "confirmada"
    ).length;
    const pending = appointments.filter((a) => a.status === "pendente").length;

    return `${total} consulta${
      total !== 1 ? "s" : ""
    } • ${confirmed} confirmada${
      confirmed !== 1 ? "s" : ""
    } • ${pending} pendente${pending !== 1 ? "s" : ""}`;
  };

  return (
    <DataList
      title={getTitle()}
      description={getDescription()}
      fetchData={fetchData}
      renderItem={renderAppointmentItem}
      pagination={pagination}
      pageSize={pageSize}
      height={height}
      emptyStateIcon={
        <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      }
      emptyStateTitle="Nenhuma consulta agendada"
      emptyStateDescription={`Não há consultas agendadas para ${
        viewMode === "day"
          ? "hoje"
          : viewMode === "week"
          ? "esta semana"
          : "este mês"
      }.`}
      emptyStateAction={
        onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Agendar Consulta
          </Button>
        )
      }
      onItemSelect={(appointment) => {
        if (onViewAppointment) {
          onViewAppointment(appointment);
        }
      }}
    />
  );
};
