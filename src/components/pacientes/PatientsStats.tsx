import { Users, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Patient } from '@/types/patient';
import { useAppointments } from '@/context/hooks/useAppointments';

interface PatientsStatsProps {
  patients: Patient[];
}

export const PatientsStats = ({ patients }: PatientsStatsProps) => {
  const totalPatients = patients.length;

  // Pacientes ativos (status === 'ativo')
  const activePatients = patients.filter((p) => p.status === 'ativo').length;

  // Pacientes criados neste mês
  const now = new Date();
  const newThisMonth = patients.filter((p) => {
    if (!p.createdAt) return false;
    const created = new Date(p.createdAt);
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth()
    );
  }).length;

  // Próximas consultas: agendamentos futuros
  const { appointments } = useAppointments();
  const upcomingAppointments = appointments.filter((a) => {
    const appointmentDate = new Date(a.appointmentAt);
    return appointmentDate > now && a.status === 'agendada';
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <StatsCard
        title="Total de Pacientes"
        value={totalPatients}
        icon={Users}
      />
      <StatsCard title="Pacientes Ativos" value={activePatients} icon={Users} />
      <StatsCard title="Novos este Mês" value={newThisMonth} icon={Plus} />
      <StatsCard
        title="Próximas Consultas"
        value={upcomingAppointments}
        icon={Users}
      />
    </div>
  );
};
