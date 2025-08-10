import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Building2 } from 'lucide-react';
import { Convenio } from '@/types/convenio';

interface ConvenioCardProps {
  convenio: Convenio;
  onEdit?: (c: Convenio) => void;
  onDelete?: (c: Convenio) => void;
}

export const ConvenioCard: React.FC<ConvenioCardProps> = ({
  convenio,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="flex flex-col h-full border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base font-semibold truncate">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="truncate" title={convenio.nome}>
                {convenio.nome}
              </span>
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px] font-medium">
                {convenio.tipo_cobertura}
              </Badge>
              <Badge
                variant={convenio.ativo ? 'default' : 'secondary'}
                className="text-[10px] font-medium"
              >
                {convenio.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground flex-1">
        <div className="grid grid-cols-1 gap-2">
          <div>
            <span className="font-semibold text-[11px] text-foreground">
              Abrangência:
            </span>{' '}
            {convenio.abrangencia?.trim() || 'Não informado'}
          </div>
          <div>
            <span className="font-semibold text-[11px] text-foreground">
              Telefone:
            </span>{' '}
            {convenio.telefone_contato?.trim() || 'Não informado'}
          </div>
          <div>
            <span className="font-semibold text-[11px] text-foreground">
              Email:
            </span>{' '}
            {convenio.email_contato?.trim() || 'Não informado'}
          </div>
          <div className="truncate" title={convenio.observacoes || undefined}>
            <span className="font-semibold text-[11px] text-foreground">
              Obs:
            </span>{' '}
            {convenio.observacoes?.trim() || 'Não informado'}
          </div>
        </div>
        <div className="mt-auto flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit?.(convenio)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            onClick={() => onDelete?.(convenio)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
