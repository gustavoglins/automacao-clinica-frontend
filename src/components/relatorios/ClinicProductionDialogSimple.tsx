import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, FileText } from 'lucide-react';
import {
  reportService,
  type ClinicProductionReport,
} from '@/services/reportService';
import { exportUtils } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface ClinicProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClinicProductionDialog = ({
  open,
  onOpenChange,
}: ClinicProductionDialogProps) => {
  const [data, setData] = useState<ClinicProductionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const report = await reportService.getClinicProductionReport();
      setData(report);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do relatório.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  const handleExportPDF = async () => {
    if (data) {
      try {
        exportUtils.exportClinicProductionToPDF(data);
        toast({
          title: 'Sucesso',
          description: 'Relatório exportado para PDF com sucesso!',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao exportar o relatório para PDF.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleExportExcel = async () => {
    if (data) {
      try {
        exportUtils.exportClinicProductionToExcel(data);
        toast({
          title: 'Sucesso',
          description: 'Relatório exportado para Excel com sucesso!',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao exportar o relatório para Excel.',
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Carregando relatório...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p>Nenhum dado disponível para o relatório.</p>
              <Button onClick={loadData} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" />
            <div>
              <DialogTitle>Relatório de Produção da Clínica</DialogTitle>
              <DialogDescription>
                Visão geral do desempenho e faturamento da clínica
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Geral */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Métrica</th>
                      <th className="text-right p-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Total de Consultas Realizadas</td>
                      <td className="text-right p-2">
                        {data.totalAppointments}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Faturamento Total</td>
                      <td className="text-right p-2">
                        R${' '}
                        {data.totalRevenue.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Valor Médio por Consulta</td>
                      <td className="text-right p-2">
                        R${' '}
                        {data.averageAppointmentValue.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Dados Mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mês</th>
                      <th className="text-right p-2">Consultas</th>
                      <th className="text-right p-2">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyData.map((month, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{month.month}</td>
                        <td className="text-right p-2">{month.appointments}</td>
                        <td className="text-right p-2">
                          R${' '}
                          {month.revenue.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Serviços por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Categoria</th>
                      <th className="text-right p-2">Quantidade</th>
                      <th className="text-right p-2">Faturamento</th>
                      <th className="text-right p-2">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.servicesByCategory.map((category, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 capitalize">
                          {category.category.replace('_', ' ')}
                        </td>
                        <td className="text-right p-2">{category.count}</td>
                        <td className="text-right p-2">
                          R${' '}
                          {category.revenue.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="text-right p-2">
                          {data.totalAppointments > 0
                            ? (
                                (category.count / data.totalAppointments) *
                                100
                              ).toFixed(1)
                            : '0'}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Exportação */}
          <div className="flex gap-4 pt-4">
            {/* <Button
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button> */}
            <Button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
