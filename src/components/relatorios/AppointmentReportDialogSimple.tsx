import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Calendar } from "lucide-react";
import {
  reportService,
  type AppointmentReport,
} from "@/services/reportService";
import { exportUtils } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface AppointmentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AppointmentReportDialog = ({
  open,
  onOpenChange,
}: AppointmentReportDialogProps) => {
  const [data, setData] = useState<AppointmentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const report = await reportService.getAppointmentReport();
      setData(report);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
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
        exportUtils.exportAppointmentReportToPDF(data);
        toast({
          title: "Sucesso",
          description: "Relatório exportado para PDF com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao exportar o relatório para PDF.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportExcel = async () => {
    if (data) {
      try {
        exportUtils.exportAppointmentReportToExcel(data);
        toast({
          title: "Sucesso",
          description: "Relatório exportado para Excel com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao exportar o relatório para Excel.",
          variant: "destructive",
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
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" />
            <div>
              <DialogTitle>Relatório de Consultas & Agenda</DialogTitle>
              <DialogDescription>
                Análise completa dos agendamentos e taxa de comparecimento
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
                      <td className="p-2">Total de Consultas</td>
                      <td className="text-right p-2">
                        {data.totalAppointments}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Consultas Confirmadas</td>
                      <td className="text-right p-2">
                        {data.confirmedAppointments}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Consultas Canceladas</td>
                      <td className="text-right p-2">
                        {data.canceledAppointments}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Taxa de Comparecimento</td>
                      <td className="text-right p-2">
                        {data.attendanceRate.toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Taxa de Falta</td>
                      <td className="text-right p-2">
                        {data.noShowRate.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Horários Mais Movimentados */}
          <Card>
            <CardHeader>
              <CardTitle>Horários Mais Movimentados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Horário</th>
                      <th className="text-right p-2">Quantidade</th>
                      <th className="text-right p-2">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.busyHours.map((hour, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{hour.hour}</td>
                        <td className="text-right p-2">{hour.count}</td>
                        <td className="text-right p-2">
                          {data.totalAppointments > 0
                            ? (
                                (hour.count / data.totalAppointments) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Quantidade</th>
                      <th className="text-right p-2">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.statusDistribution.map((status, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 capitalize">
                          {status.status.replace("_", " ")}
                        </td>
                        <td className="text-right p-2">{status.count}</td>
                        <td className="text-right p-2">
                          {status.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal das Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mês</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Confirmadas</th>
                      <th className="text-right p-2">Canceladas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyAppointments.map((month, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{month.month}</td>
                        <td className="text-right p-2">{month.total}</td>
                        <td className="text-right p-2">{month.confirmed}</td>
                        <td className="text-right p-2">{month.canceled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Exportação */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleExportExcel}
              variant="primary"
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
