import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Filter,
  MoreVertical,
  Shield,
  Heart,
  Eye,
  Zap,
  Star,
  Stethoscope,
} from "lucide-react";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

// const serviceCategories = [
//   { value: "clinico_geral", label: "Clínico Geral", icon: Stethoscope },
//   { value: "ortodontia", label: "Ortodontia", icon: Zap },
//   { value: "endodontia", label: "Endodontia", icon: Star },
//   { value: "implantodontia", label: "Implantodontia", icon: Shield },
//   { value: "periodontia", label: "Periodontia", icon: Heart },
//   { value: "proteses", label: "Próteses", icon: Star },
//   { value: "odontopediatria", label: "Odontopediatria", icon: Heart },
//   { value: "cirurgia", label: "Cirurgia", icon: Stethoscope },
//   { value: "radiologia", label: "Radiologia", icon: Zap },
//   { value: "estetica", label: "Estética", icon: Star },
//   { value: "preventivo", label: "Preventivo", icon: Shield },
//   { value: "outros", label: "Outros", icon: Eye },
// ];

const serviceCategories = [
  { value: "clinico_geral", label: "Clínico Geral", icon: Stethoscope },
  { value: "ortodontia", label: "Ortodontia", icon: Stethoscope },
  { value: "endodontia", label: "Endodontia", icon: Stethoscope },
  { value: "implantodontia", label: "Implantodontia", icon: Stethoscope },
  { value: "periodontia", label: "Periodontia", icon: Stethoscope },
  { value: "proteses", label: "Próteses", icon: Stethoscope },
  { value: "odontopediatria", label: "Odontopediatria", icon: Stethoscope },
  { value: "cirurgia", label: "Cirurgia", icon: Stethoscope },
  { value: "radiologia", label: "Radiologia", icon: Stethoscope },
  { value: "estetica", label: "Estética", icon: Stethoscope },
  { value: "preventivo", label: "Preventivo", icon: Stethoscope },
  { value: "outros", label: "Outros", icon: Stethoscope },
];

// Função para obter a badge de status do serviço
const getServiceStatusBadge = (isActive: boolean) => {
  return isActive
    ? { variant: "success" as const }
    : { variant: "muted" as const };
};

// Função para obter a badge de categoria com cores específicas
const getCategoryBadge = (category: string) => {
  switch (category) {
    case "clinico_geral":
      return {
        variant: "info" as const,
        className: "bg-blue-100 text-blue-700 border-transparent",
      };
    case "ortodontia":
      return {
        variant: "outline" as const,
        className: "bg-purple-100 text-purple-700 border-transparent",
      };
    case "endodontia":
      return {
        variant: "success" as const,
        className: "bg-green-100 text-green-700 border-transparent",
      };
    case "implantodontia":
      return {
        variant: "outline" as const,
        className: "bg-cyan-100 text-cyan-700 border-transparent",
      };
    case "periodontia":
      return {
        variant: "outline" as const,
        className: "bg-emerald-100 text-emerald-700 border-transparent",
      };
    case "proteses":
      return {
        variant: "outline" as const,
        className: "bg-yellow-100 text-yellow-700 border-transparent",
      };
    case "odontopediatria":
      return {
        variant: "outline" as const,
        className: "bg-pink-100 text-pink-700 border-transparent",
      };
    case "cirurgia":
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-700 border-transparent",
      };
    case "radiologia":
      return {
        variant: "outline" as const,
        className: "bg-gray-200 text-gray-700 border-transparent",
      };
    case "estetica":
      return {
        variant: "warning" as const,
        className: "bg-yellow-100 text-yellow-700 border-transparent",
      };
    case "preventivo":
      return {
        variant: "success" as const,
        className: "bg-green-100 text-green-700 border-transparent",
      };
    case "outros":
      return {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-700 border-transparent",
      };
    default:
      return {
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-700 border-transparent",
      };
  }
};

// Função para obter a cor do ícone de categoria
const getCategoryIconColor = (category: string) => {
  switch (category) {
    case "preventivo":
      return "bg-green-100 text-green-800";
    case "restaurador":
      return "bg-blue-100 text-blue-800";
    case "ortodontia":
      return "bg-purple-100 text-purple-800";
    case "cirurgia":
      return "bg-red-100 text-red-800";
    case "estetico":
      return "bg-yellow-100 text-yellow-800";
    case "emergencia":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  const getCategoryInfo = (category: string) => {
    return (
      serviceCategories.find((cat) => cat.value === category) ||
      serviceCategories[0]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}min`
        : `${hours}h`;
    }
    return `${minutes}min`;
  };

  const categoryInfo = getCategoryInfo(service.category);
  const CategoryIcon = categoryInfo.icon;
  const statusBadge = getServiceStatusBadge(service.active);
  const categoryBadge = getCategoryBadge(service.category);
  // O ícone agora usará as mesmas classes de cor da badge de categoria
  const iconColorClass = categoryBadge.className;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconColorClass}`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 leading-tight">
                {service.name}
              </h3>
              <Badge variant={statusBadge.variant} className="mt-1">
                {service.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(service)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description || "Sem descrição"}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Preço:</span>
            </div>
            <span className="font-semibold text-green-600">
              {formatPrice(service.price)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Duração:</span>
            </div>
            <span className="font-medium">
              {formatDuration(service.durationMinutes)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Categoria:</span>
            </div>
            <Badge
              variant={categoryBadge.variant}
              className={categoryBadge.className}
            >
              {categoryInfo.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
