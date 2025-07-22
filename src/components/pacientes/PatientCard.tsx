import { Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/patient";
import { getPatientStatusBadge, getPlanBadge } from "@/lib/badgeUtils";

interface PatientCardProps {
  patient: Patient;
  onViewRecord?: (patient: Patient) => void;
}

export const PatientCard = ({
  patient,
  onViewRecord
}: PatientCardProps) => {
  const getInitials = (fullName: string) => {
    return fullName.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const statusBadge = getPatientStatusBadge('ativo');
  const planBadge = getPlanBadge();

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="font-semibold text-blue-600">
            {getInitials(patient.fullName)}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{patient.fullName}</h3>
            <Badge variant={statusBadge.variant} className={statusBadge.className}>
              Ativo
            </Badge>
            <Badge variant={planBadge.variant} className={planBadge.className}>
              {/* Plano removido */}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{calculateAge(patient.birthDate)} anos</span>
            {patient.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {patient.phone}
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {patient.email}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>CPF: {patient.cpf}</span>
            {patient.address && (
              <span className="text-gray-500">
                {patient.address}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="classic"
          onClick={() => onViewRecord?.(patient)}
        >
          Ver Prontuário
        </Button>
      </div>
    </div>
  );
};
