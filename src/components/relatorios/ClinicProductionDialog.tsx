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
} from "recharts";
import { Download, FileText, TrendingUp, DollarSign } from "lucide-react";
import {
  reportService,
  type ClinicProductionReport,
} from "@/services/reportService";
import { exportUtils } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ClinicProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
      exportUtils.exportClinicProductionToPDF(data);
      toast({
        title: "Sucesso",
        description: "Relatório exportado para PDF com sucesso!",
      });
    }
  };

  const handleExportExcel = () => {
    if (data) {
      exportUtils.exportClinicProductionToExcel(data);
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
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Consultas
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalAppointments}
                </div>
                <p className="text-xs text-muted-foreground">
                  Consultas realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Faturamento Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R${" "}
                  {data.totalRevenue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Receita gerada</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Valor Médio por Consulta
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R${" "}
                  {data.averageAppointmentValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Ticket médio</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Evolução Mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue"
                          ? `R$ ${Number(value).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : value,
                        name === "revenue" ? "Faturamento" : "Consultas",
                      ]}
                    />
                    <Bar
                      dataKey="appointments"
                      fill="#8884d8"
                      name="appointments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Serviços por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Serviços por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.servicesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.servicesByCategory.map((entry, index) => (
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

          {/* Tabela de Dados Mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Mensais Detalhados</CardTitle>
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
                          R${" "}
                          {month.revenue.toLocaleString("pt-BR", {
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
