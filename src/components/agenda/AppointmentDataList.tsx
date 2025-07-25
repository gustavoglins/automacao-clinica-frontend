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
  getBorderColor?: (appointment: Appointment) => "green" | "gray" | "blue";
}

export const AppointmentDataList: React.FC<AppointmentDataListProps> = ({
  appointments,
  onViewAppointment,
  onAddNew,
  pagination = "paged",
  pageSize = 6,
  height = "500px",
  viewMode = "day",
  getBorderColor,
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

    // Definir cor da borda esquerda
    let borderColor = "border-l-blue-500";
    if (getBorderColor) {
      const color = getBorderColor(appointment);
      if (color === "green") borderColor = "border-l-green-500";
      else if (color === "gray") borderColor = "border-l-gray-400";
      else borderColor = "border-l-blue-500";
    }

    return (
      <div
        key={appointment.id}
        className={`flex items-center justify-between p-3 bg-white border border-gray-200 border-l-4 ${borderColor} rounded-xl hover:shadow-card transition-all duration-300 cursor-pointer`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {appointment.patient?.fullName || "Paciente não encontrado"}
            </p>
            <p className="text-sm text-gray-600">
              {appointment.service?.name || "Serviço não encontrado"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {appointment.employee?.fullName || "Funcionário não encontrado"}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Ver Mais
            </Button>
            {appointment.status === "pendente" && (
              <Button size="sm" variant="default">
                Confirmar
              </Button>
            )}
          </div>
        </div>
      </div>
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
