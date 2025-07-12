import { Phone, Mail, Calendar, Edit, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Patient } from "@/types/patient";
import { getPatientStatusBadge, getPlanBadge } from "@/lib/badgeUtils";

interface PatientCardProps {
  patient: Patient;
  onSchedule?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onViewRecord?: (patient: Patient) => void;
}

export const PatientCard = ({
  patient,
  onSchedule,
  onEdit,
  onViewRecord
}: PatientCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const statusBadge = getPatientStatusBadge(patient.status);
  const planBadge = getPlanBadge();

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="font-semibold text-primary">
            {getInitials(patient.name)}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{patient.name}</h3>
            <Badge variant={statusBadge.variant} className={statusBadge.className}>
              {patient.status}
            </Badge>
            <Badge variant={planBadge.variant} className={planBadge.className}>
              {patient.plan}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Última: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
            {patient.nextVisit && (
              <span className="text-primary">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="classic" className="px-2">
              <span className="sr-only">Mais opções</span>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSchedule?.(patient)}>
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              Agendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(patient)}>
              <Edit className="w-4 h-4 mr-2 text-muted-foreground" />
              Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
