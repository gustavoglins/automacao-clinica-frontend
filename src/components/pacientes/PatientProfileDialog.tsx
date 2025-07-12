import React from "react";
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
  Calendar,
  MapPin,
  Clock,
  Edit,
  Trash2,
  FileText,
  Shield,
  CreditCard,
  Stethoscope,
  ChevronRight,
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return patient.age;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const statusBadge = getPatientStatusBadge(patient.status);
  const planBadge = getPlanBadge();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Dados do Paciente
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-white/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Patient Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {getInitials(patient.name)}
              </div>
              {patient.status === 'ativo' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{patient.name}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span>Gênero: Feminino</span>
                <span>•</span>
                <span>Nascimento: {formatDate("1994-07-22")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusBadge.variant} className={statusBadge.className}>
                  {patient.status}
                </Badge>
                <Badge variant={planBadge.variant} className={planBadge.className}>
                  {patient.plan}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onSchedule(patient)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Consulta
            </Button>
            <Button
              variant="outline"
              onClick={() => onEdit(patient)}
              className="px-4"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <Separator />

          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outros Detalhes de Contato</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Telefone</p>
                  <p className="text-gray-900">{formatPhone(patient.phone)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celular</p>
                  <p className="text-gray-900">{formatPhone(patient.phone)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Celular</p>
                  <p className="text-gray-900">r.pole@email.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Appointment */}
          {patient.nextVisit && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Próxima Consulta</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">Dr. João Silva</span>
                  <span className="text-green-700 font-medium">
                    {formatDate(patient.nextVisit)} • 07:15 - 08:00
                  </span>
                </div>
                <p className="text-green-700 text-sm mb-1">Consulta de rotina agendada</p>
                <p className="text-green-600 text-sm">+1 (11) 1234 567</p>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
              onClick={() => onViewRecord(patient)}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Consultas</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Plano de Saúde</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Histórico de Pagamentos</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 px-4 hover:bg-gray-50"
              onClick={() => onViewRecord(patient)}
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Prontuário Médico</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
