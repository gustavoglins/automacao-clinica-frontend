import { Users, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Patient } from "@/types/patient";

interface PatientsStatsProps {
  patients: Patient[];
}

export const PatientsStats = ({ patients }: PatientsStatsProps) => {
  const totalPatients = patients.length;

  // Mock data for now - these would come from actual data/API
  const newThisMonth = 45;
  const upcomingAppointments = 89;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <StatsCard
        title="Total de Pacientes"
        value={totalPatients}
        icon={Users}
      />
      <StatsCard title="Pacientes Ativos" value={totalPatients} icon={Users} />
      <StatsCard title="Novos este Mês" value={newThisMonth} icon={Plus} />
      <StatsCard
        title="Próximas Consultas"
        value={upcomingAppointments}
        icon={Users}
      />
    </div>
  );
};
