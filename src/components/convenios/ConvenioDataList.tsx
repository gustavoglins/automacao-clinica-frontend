import React from 'react';
import { DataList } from '@/components/ui/data-list';
import { Convenio } from '@/types/convenio';
import { ConvenioCard } from './ConvenioCard';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createFetchDataFromArray } from '@/lib/dataListUtils';

interface ConvenioDataListProps {
  convenios: Convenio[];
  onEdit?: (c: Convenio) => void;
  onDelete?: (c: Convenio) => void;
  onAddNew?: () => void;
  pagination?: 'paged' | 'infinite';
  pageSize?: number;
  height?: string;
  hasFilters?: boolean;
}

export const ConvenioDataList: React.FC<ConvenioDataListProps> = ({
  convenios,
  onEdit,
  onDelete,
  onAddNew,
  pagination = 'paged',
  pageSize = 9,
  height = '600px',
  hasFilters = false,
}) => {
  const fetchData = createFetchDataFromArray(convenios);

  const renderItem = (c: Convenio) => (
    <div className="flex-1 min-w-0">
      <ConvenioCard convenio={c} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );

  return (
    <DataList
      title="Convênios"
      description="Convênios aceitos pela clínica"
      fetchData={fetchData}
      renderItem={renderItem}
      pagination={pagination}
      pageSize={pageSize}
      height={height}
      emptyStateIcon={
        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      }
      emptyStateTitle="Nenhum convênio encontrado"
      emptyStateDescription={
        hasFilters
          ? 'Tente modificar os filtros de busca'
          : 'Cadastre o primeiro convênio aceito pela clínica'
      }
      emptyStateAction={
        !hasFilters &&
        onAddNew && (
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Convênio
          </Button>
        )
      }
      className="w-full"
      gridLayout="3-columns"
    />
  );
};
