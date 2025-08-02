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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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

  const handleExportPDF = () => {
    if (data) {
      exportUtils.exportAppointmentReportToPDF(data);
      toast({
        title: "Sucesso",
        description: "Relatório exportado para PDF com sucesso!",
      });
    }
  };

  const handleExportExcel = () => {
    if (data) {
      exportUtils.exportAppointmentReportToExcel(data);
      toast({
        title: "Sucesso",
        description: "Relatório exportado para Excel com sucesso!",
      });
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Consultas
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalAppointments}
                </div>
                <p className="text-xs text-muted-foreground">Total agendado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Confirmadas
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.confirmedAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Consultas realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Comparecimento
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.attendanceRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Pacientes que compareceram
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Falta
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data.noShowRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Pacientes que faltaram
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Horários Movimentados */}
            <Card>
              <CardHeader>
                <CardTitle>Horários Mais Movimentados</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.busyHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Consultas"]} />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Status das Consultas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percentage }) =>
                        `${status}: ${percentage.toFixed(1)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Evolução Mensal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal das Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.monthlyAppointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Total"
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmed"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Confirmadas"
                  />
                  <Line
                    type="monotone"
                    dataKey="canceled"
                    stroke="#FF8042"
                    strokeWidth={2}
                    name="Canceladas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Horários Movimentados */}
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

          {/* Tabela de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Detalhada por Status</CardTitle>
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

          {/* Botões de Exportação */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="flex items-center gap-2"
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
