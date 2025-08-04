import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarX,
  Plus,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Closure } from '@/types/closure';
import { closureService } from '@/services/closureService';
import { AddClosureDialog } from '@/components/fechamentos';
import { EditClosureDialog } from '@/components/fechamentos';
import { DeleteClosureDialog } from '@/components/fechamentos';

export default function Fechamentos() {
  const [closures, setClosures] = useState<Closure[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClosure, setSelectedClosure] = useState<Closure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar fechamentos
  const loadClosures = async () => {
    setIsLoading(true);
    try {
      const data = await closureService.getAllClosures();
      setClosures(data);
    } catch (error) {
      console.error('Erro ao carregar fechamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClosures();
  }, []);

  const handleAddClosure = async (
    closureData: Omit<Closure, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const newClosure = await closureService.createClosure(closureData);
      setClosures((prev) => [...prev, newClosure]);
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Erro ao criar fechamento:', error);
    }
  };

  const handleEditClosure = async (closureData: Closure) => {
    try {
      const updatedClosure = await closureService.updateClosure(closureData);
      setClosures((prev) =>
        prev.map((closure) =>
          closure.id === closureData.id ? updatedClosure : closure
        )
      );
      setOpenEditDialog(false);
      setSelectedClosure(null);
    } catch (error) {
      console.error('Erro ao atualizar fechamento:', error);
    }
  };

  const handleDeleteClosure = async (id: string) => {
    try {
      await closureService.deleteClosure(id);
      setClosures((prev) => prev.filter((closure) => closure.id !== id));
      setOpenDeleteDialog(false);
      setSelectedClosure(null);
    } catch (error) {
      console.error('Erro ao deletar fechamento:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      feriado: 'Feriado',
      férias: 'Férias',
      recesso: 'Recesso',
      manutenção: 'Manutenção',
      treinamento: 'Treinamento',
      evento: 'Evento',
      outro: 'Outro',
    };
    return types[type as keyof typeof types] || 'Outro';
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants = {
      feriado: 'destructive',
      férias: 'secondary',
      recesso: 'outline',
      manutenção: 'outline',
      treinamento: 'default',
      evento: 'default',
      outro: 'default',
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return startDate === endDate ? start : `${start} - ${end}`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Fechamentos da Clínica
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie os dias em que a clínica não funcionará
            </p>
          </div>
          <Button
            onClick={() => setOpenAddDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Fechamento
          </Button>
        </div>

        {/* Lista de Fechamentos */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <p className="text-gray-500">Carregando fechamentos...</p>
              </CardContent>
            </Card>
          ) : closures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarX className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum fechamento cadastrado
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Cadastre feriados, férias e outros períodos em que a clínica
                  não funcionará
                </p>
                <Button onClick={() => setOpenAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Fechamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            closures.map((closure) => (
              <Card
                key={closure.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{closure.name}</CardTitle>
                      <Badge
                        variant={
                          getTypeBadgeVariant(closure.type) as
                            | 'default'
                            | 'destructive'
                            | 'outline'
                            | 'secondary'
                        }
                      >
                        {getTypeLabel(closure.type)}
                      </Badge>
                      {closure.is_recurring && (
                        <Badge variant="outline">Recorrente</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClosure(closure);
                          setOpenEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClosure(closure);
                          setOpenDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {formatDateRange(closure.start_date, closure.end_date)}
                      </span>
                    </div>
                    {closure.description && (
                      <p className="text-sm text-gray-700">
                        {closure.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialogs */}
        <AddClosureDialog
          open={openAddDialog}
          onOpenChange={setOpenAddDialog}
          onAddClosure={handleAddClosure}
        />

        {selectedClosure && (
          <EditClosureDialog
            open={openEditDialog}
            onOpenChange={setOpenEditDialog}
            closure={selectedClosure}
            onEditClosure={handleEditClosure}
          />
        )}

        {selectedClosure && (
          <DeleteClosureDialog
            open={openDeleteDialog}
            onOpenChange={setOpenDeleteDialog}
            closure={selectedClosure}
            onDeleteClosure={handleDeleteClosure}
          />
        )}
      </div>
    </AppLayout>
  );
}
