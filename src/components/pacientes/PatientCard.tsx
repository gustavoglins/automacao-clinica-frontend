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
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const statusBadge = getPatientStatusBadge(patient.status);
  const planBadge = getPlanBadge();

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="font-semibold text-blue-600">
            {getInitials(patient.name)}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{patient.name}</h3>
            <Badge variant={statusBadge.variant} className={statusBadge.className}>
              {patient.status}
            </Badge>
            <Badge variant={planBadge.variant} className={planBadge.className}>
              {patient.plan}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{patient.age} anos</span>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {patient.phone}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {patient.email}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Última: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
            {patient.nextVisit && (
              <span className="text-blue-600">
                Próxima: {new Date(patient.nextVisit).toLocaleDateString('pt-BR')}
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
