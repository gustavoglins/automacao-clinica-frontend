import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

// Status badges para pacientes
export const getPatientStatusBadge = (status: string): { variant: BadgeVariant; className?: string } => {
  switch (status.toLowerCase()) {
    case 'ativo':
      return { variant: 'success' };
    case 'inativo':
      return { variant: 'muted' };
    case 'em_tratamento':
      return { variant: 'info' };
    case 'aguardando':
      return { variant: 'warning' };
    default:
      return { variant: 'outline' };
  }
};

// Status badges para funcionários
export const getEmployeeStatusBadge = (status: string): { variant: BadgeVariant; className?: string } => {
  switch (status.toLowerCase()) {
    case 'ativo':
      return { variant: 'success' };
    case 'inativo':
      return { variant: 'muted' };
    case 'em_ferias':
      return { variant: 'warning' };
    case 'licenca':
      return { variant: 'info' };
    default:
      return { variant: 'outline' };
  }
};

// Status badges para agendamentos
export const getAppointmentStatusBadge = (status: string): { variant: BadgeVariant; className?: string } => {
  switch (status.toLowerCase()) {
    case 'agendado':
    case 'agendada':
      return { variant: 'info', className: 'bg-blue-100 text-blue-700 border-transparent' };
    case 'confirmado':
    case 'confirmada':
      return { variant: 'success', className: 'bg-green-100 text-green-700 border-transparent' };
    case 'pendente':
      return { variant: 'warning', className: 'bg-yellow-100 text-yellow-700 border-transparent' };
    case 'reagendado':
    case 'reagendada':
      return { variant: 'outline', className: 'bg-orange-100 text-orange-700 border-transparent' };
    case 'cancelado':
    case 'cancelada':
      return { variant: 'destructive', className: 'bg-red-100 text-red-700 border-transparent' };
    case 'em_andamento':
      return { variant: 'outline', className: 'bg-purple-100 text-purple-700 border-transparent' };
    case 'concluido':
    case 'concluida':
      return { variant: 'success', className: 'bg-green-100 text-green-700 border-transparent' };
    case 'faltou':
      return { variant: 'muted', className: 'bg-gray-100 text-gray-700 border-transparent' };
    default:
      return { variant: 'outline', className: 'bg-gray-100 text-gray-700 border-transparent' };
  }
};

// Badge para planos/convênios
export const getPlanBadge = (): { variant: BadgeVariant; className?: string } => {
  return { variant: 'outline' };
};

// Badge para especialidades
export const getSpecialtyBadge = (): { variant: BadgeVariant; className?: string } => {
  return { variant: 'secondary' };
};

// Badge para contadores
export const getCountBadge = (): { variant: BadgeVariant; className?: string } => {
  return { variant: 'secondary' };
};
