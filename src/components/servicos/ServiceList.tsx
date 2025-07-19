import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Stethoscope } from "lucide-react";
import ServiceCard from "./ServiceCard";
import { Service } from "@/types/service";

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onAddNew: () => void;
  hasFilters: boolean;
}

const ServiceList: React.FC<ServiceListProps> = ({
  services,
  onEdit,
  onDelete,
  onAddNew,
  hasFilters
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Serviços</CardTitle>
        <CardDescription>
          {services.length} serviços registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço encontrado</h3>
            <p className="text-gray-600 mb-4">
              {hasFilters
                ? "Tente ajustar os filtros ou buscar por outros termos"
                : "Comece adicionando o primeiro serviço da clínica"
              }
            </p>
            {!hasFilters && (
              <Button
                onClick={onAddNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Serviço
              </Button>
            )}
          </div>
        ) : (
          <div className="h-[600px] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceList;
