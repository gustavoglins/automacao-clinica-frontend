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
      return { variant: 'info' };
    case 'confirmado':
      return { variant: 'success' };
    case 'cancelado':
      return { variant: 'destructive' };
    case 'em_andamento':
      return { variant: 'warning' };
    case 'concluido':
      return { variant: 'success' };
    case 'faltou':
      return { variant: 'muted' };
    default:
      return { variant: 'outline' };
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
