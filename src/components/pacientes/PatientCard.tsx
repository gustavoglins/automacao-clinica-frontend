import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types/patient';
import { getPatientStatusBadge, getPlanBadge } from '@/lib/badgeUtils';

interface PatientCardProps {
  patient: Patient;
  onViewRecord?: (patient: Patient) => void;
}

export const PatientCard = ({ patient, onViewRecord }: PatientCardProps) => {
  const getInitials = (fullName?: string | null) => {
    const name = (fullName || '').trim();
    if (!name) return '??';
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2) || '??'
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const statusBadge = getPatientStatusBadge(patient.status || 'ativo');
  const planBadge = getPlanBadge();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-xl gap-3 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
          <span className="font-semibold text-green-700 text-sm sm:text-base">
            {getInitials(patient.fullName)}
          </span>
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {patient.fullName || 'Nome não informado'}
            </h3>
            <Badge
              variant={statusBadge.variant}
              className={`${statusBadge.className} text-xs`}
            >
              {patient.status === 'ativo'
                ? 'Ativo'
                : patient.status === 'inativo'
                ? 'Inativo'
                : 'Ativo'}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span>{calculateAge(patient.birthDate)} anos</span>
            {patient.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span className="truncate">{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
            <span className="truncate">CPF: {formatCPF(patient.cpf)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        <Button
          size="sm"
          variant="classic"
          onClick={() => onViewRecord?.(patient)}
          className="text-sm w-full sm:w-auto"
        >
          Ver Perfil
        </Button>
      </div>
    </div>
  );
};
