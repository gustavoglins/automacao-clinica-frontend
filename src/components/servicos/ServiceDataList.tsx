import React from "react";
import { DataList } from "@/components/ui/data-list";
import ServiceCard from "./ServiceCard";
import { Service } from "@/types/service";
import { createServicesFetchData } from "@/lib/dataListUtils";
import { Stethoscope, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiceDataListProps {
  services: Service[];
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onAddNew?: () => void;
  pagination?: "paged" | "infinite";
  pageSize?: number;
  height?: string;
  hasFilters?: boolean;
}

export const ServiceDataList: React.FC<ServiceDataListProps> = ({
  services,
  onEdit,
  onDelete,
  onAddNew,
  pagination = "paged",
  pageSize = 6,
  height = "400px",
  hasFilters = false,
}) => {
  const fetchData = createServicesFetchData(services);

  const renderServiceItem = (service: Service) => (
    <div className="flex-1 min-w-0">
      <ServiceCard
        key={service.id}
        service={service}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );

  return (
    <DataList
      title="Lista de Serviços"
      description="Visualize e gerencie todos os serviços da clínica"
      fetchData={fetchData}
      renderItem={renderServiceItem}
      pagination={pagination}
      pageSize={pageSize}
      height={height}
      emptyStateIcon={
        <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      }
      emptyStateTitle="Nenhum serviço encontrado"
      emptyStateDescription={
        hasFilters
          ? "Tente ajustar os filtros ou buscar por outros termos"
          : "Comece adicionando o primeiro serviço da clínica"
      }
      emptyStateAction={
        !hasFilters &&
        onAddNew && (
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Serviço
          </Button>
        )
      }
      className="w-full"
      gridLayout="3-columns"
    />
  );
};
