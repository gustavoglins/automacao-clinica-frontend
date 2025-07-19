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
  Stethoscope
} from "lucide-react";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const serviceCategories = [
  { value: "preventivo", label: "Preventivo", icon: Shield },
  { value: "restaurador", label: "Restaurador", icon: Heart },
  { value: "ortodontia", label: "Ortodontia", icon: Zap },
  { value: "cirurgia", label: "Cirurgia", icon: Stethoscope },
  { value: "estetico", label: "Estético", icon: Star },
  { value: "emergencia", label: "Emergência", icon: Zap }
];

// Função para obter a badge de status do serviço
const getServiceStatusBadge = (isActive: boolean) => {
  return isActive
    ? { variant: 'success' as const }
    : { variant: 'muted' as const };
};

// Função para obter a badge de categoria com cores específicas
const getCategoryBadge = (category: string) => {
  switch (category) {
    case "preventivo":
      return { variant: 'success' as const, className: 'bg-green-100 text-green-700 border-transparent' };
    case "restaurador":
      return { variant: 'info' as const, className: 'bg-blue-100 text-blue-700 border-transparent' };
    case "ortodontia":
      return { variant: 'outline' as const, className: 'bg-purple-100 text-purple-700 border-transparent' };
    case "cirurgia":
      return { variant: 'destructive' as const, className: 'bg-red-100 text-red-700 border-transparent' };
    case "estetico":
      return { variant: 'warning' as const, className: 'bg-yellow-100 text-yellow-700 border-transparent' };
    case "emergencia":
      return { variant: 'outline' as const, className: 'bg-orange-100 text-orange-700 border-transparent' };
    default:
      return { variant: 'outline' as const, className: 'bg-gray-100 text-gray-700 border-transparent' };
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

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete }) => {
  const getCategoryInfo = (category: string) => {
    return serviceCategories.find(cat => cat.value === category) || serviceCategories[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  const categoryInfo = getCategoryInfo(service.category);
  const CategoryIcon = categoryInfo.icon;
  const statusBadge = getServiceStatusBadge(service.active);
  const categoryBadge = getCategoryBadge(service.category);
  const iconColorClass = getCategoryIconColor(service.category);

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
              <Badge
                variant={statusBadge.variant}
                className="mt-1"
              >
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
