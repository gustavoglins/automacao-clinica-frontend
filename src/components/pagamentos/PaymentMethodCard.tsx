import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// Icons are imported below in a consolidated import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, CreditCard, MoreVertical } from 'lucide-react';
import { PaymentMethod } from '@/types/paymentMethod';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onEdit?: (m: PaymentMethod) => void;
  onDelete?: (m: PaymentMethod) => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow p-3">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 text-[13px] font-semibold">
          <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate" title={method.name}>
            {method.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            variant={method.active ? 'success' : 'muted'}
            className="text-[10px] font-medium px-2 py-1  leading-none"
          >
            {method.active ? 'Ativo' : 'Inativo'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(method)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(method)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {method.description && (
        <div
          className="pt-1 text-[11px] text-muted-foreground truncate"
          title={method.description || undefined}
        >
          {method.description}
        </div>
      )}
    </Card>
  );
};
