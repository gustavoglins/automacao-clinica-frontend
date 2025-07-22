import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Edit,
  Trash2,
  FileText,
  Stethoscope,
  X
} from "lucide-react";
import { Patient } from "@/types/patient";
import { getPatientStatusBadge, getPlanBadge } from "@/lib/badgeUtils";

interface PatientProfileDialogProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onViewRecord: (patient: Patient) => void;
}

export const PatientProfileDialog: React.FC<PatientProfileDialogProps> = ({
  patient,
  isOpen,
  onClose,
  onSchedule,
  onEdit,
  onViewRecord
}) => {
  if (!patient) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "Não informado";
    return phone;
  };

  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const calculateAge = (birthDate?: string) => {
    const date = birthDate || patient.birthDate;
    if (!date) return "-";
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const statusBadge = getPatientStatusBadge(patient.status || "");
  const planBadge = getPlanBadge();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Perfil do Paciente
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
          {/* Patient Header */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {getInitials(patient.fullName)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 truncate">{patient.fullName}</h2>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {calculateAge()} anos
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {patient.plan || "-"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {patient.status || "-"}
                </Badge>
                <Badge variant="info" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Última visita: {formatDate(patient.lastVisit || "")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onSchedule(patient)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Agendar Consulta
            </Button>
            <Button
              variant="outline"
              onClick={() => onEdit(patient)}
              className="px-6 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          {/* Próxima Consulta */}
          {patient.nextVisit && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-green-600" />
                Próxima Consulta
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-800">Dr. João Silva</span>
                  <span className="text-green-700 font-medium">
                    {formatDate(patient.nextVisit)} • 07:15 - 08:00
                  </span>
                </div>
                <p className="text-green-700 text-sm mb-1">Consulta de rotina agendada</p>
                <p className="text-green-600 text-sm">Consultório 02</p>
              </div>
            </div>
          )}

          {/* Prontuário Médico */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Prontuário Médico
            </h3>
            <div className="space-y-4">
              {/* Resumo das Últimas Consultas */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Últimas Consultas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-700">15/12/2024 - Consulta de rotina</span>
                    <span className="text-green-600 font-medium">Dr. João Silva</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-700">10/11/2024 - Limpeza</span>
                    <span className="text-green-600 font-medium">Dra. Maria Santos</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-700">05/10/2024 - Avaliação</span>
                    <span className="text-green-600 font-medium">Dr. João Silva</span>
                  </div>
                </div>
              </div>

              {/* Observações Médicas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Observações Médicas</h4>
                <p className="text-blue-700 text-sm">
                  Paciente apresenta sensibilidade dentária leve. Recomendado uso de pasta dessensibilizante.
                  Sem alergias medicamentosas conhecidas.
                </p>
              </div>

              {/* Tratamentos em Andamento */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2">Tratamentos em Andamento</h4>
                <div className="space-y-1">
                  <p className="text-amber-700 text-sm">• Aparelho ortodôntico - 8 meses de tratamento</p>
                  <p className="text-amber-700 text-sm">• Acompanhamento mensal</p>
                </div>
              </div>

              {/* Botão para Ver Prontuário Completo */}
              <Button
                variant="outline"
                onClick={() => onViewRecord(patient)}
                className="w-full h-12 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Prontuário Completo
              </Button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900 font-medium break-all">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Telefone</p>
                  <p className="text-gray-900 font-medium">{formatPhone(patient.phone)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Idade</p>
                  <p className="text-gray-900 font-medium">{calculateAge()} anos</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Plano de Saúde</p>
                  <p className="text-gray-900 font-medium">{patient.plan || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-green-600" />
              Informações Médicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Última Visita</p>
                  <p className="text-gray-900 font-medium">{formatDate(patient.lastVisit || "")}</p>
                </div>
                {/* Plano de Saúde removido */}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Próxima Consulta</p>
                  <p className="text-gray-900 font-medium">
                    {patient.nextVisit ? formatDate(patient.nextVisit) : "Não agendada"}
                  </p>
                </div>
                {/* Convênio removido */}
              </div>
            </div>
          </div>
          {/* Convênio removido */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
