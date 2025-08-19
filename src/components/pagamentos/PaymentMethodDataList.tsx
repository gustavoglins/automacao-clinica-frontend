import React from 'react';
import { DataList } from '@/components/ui/data-list';
import { PaymentMethod } from '@/types/paymentMethod';
import { PaymentMethodCard } from './PaymentMethodCard';
import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createFetchDataFromArray } from '@/lib/dataListUtils';

interface PaymentMethodDataListProps {
  methods: PaymentMethod[];
  onEdit?: (m: PaymentMethod) => void;
  onDelete?: (m: PaymentMethod) => void;
  onAddNew?: () => void;
  pagination?: 'paged' | 'infinite';
  pageSize?: number;
  height?: string;
  hasFilters?: boolean;
}

export const PaymentMethodDataList: React.FC<PaymentMethodDataListProps> = ({
  methods,
  onEdit,
  onDelete,
  onAddNew,
  pagination = 'paged',
  pageSize = 9,
  height = '600px',
  hasFilters = false,
}) => {
  const fetchData = createFetchDataFromArray(methods);

  const renderItem = (m: PaymentMethod) => (
    <div className="flex-1 min-w-0">
      <PaymentMethodCard method={m} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );

  return (
    <DataList
      title="Métodos de Pagamento"
      description="Formas de pagamento aceitas pela clínica"
      fetchData={fetchData}
      renderItem={renderItem}
      pagination={pagination}
      pageSize={pageSize}
      height={height}
      emptyStateIcon={
        <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      }
      emptyStateTitle="Nenhum método de pagamento"
      emptyStateDescription={
        hasFilters
          ? 'Tente modificar os filtros de busca'
          : 'Cadastre a primeira forma de pagamento da clínica'
      }
      emptyStateAction={
        !hasFilters &&
        onAddNew && (
          <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Método
          </Button>
        )
      }
      className="w-full"
      gridLayout="3-columns"
    />
  );
};
