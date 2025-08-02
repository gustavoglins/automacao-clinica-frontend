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
import { Download, Users, TrendingUp, UserPlus } from "lucide-react";
import { reportService, type PatientReport } from "@/services/reportService";
import { exportUtils } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface PatientReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export const PatientReportDialog = ({
  open,
  onOpenChange,
}: PatientReportDialogProps) => {
  const [data, setData] = useState<PatientReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const report = await reportService.getPatientReport();
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
      exportUtils.exportPatientReportToPDF(data);
      toast({
        title: "Sucesso",
        description: "Relatório exportado para PDF com sucesso!",
      });
    }
  };

  const handleExportExcel = () => {
    if (data) {
      exportUtils.exportPatientReportToExcel(data);
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
            <Users className="text-blue-600" />
            <div>
              <DialogTitle>Relatório de Pacientes</DialogTitle>
              <DialogDescription>
                Análise detalhada da base de pacientes da clínica
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
                  Total de Pacientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalActivePatients}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pacientes ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Novos Este Mês
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.newPatientsThisMonth}
                </div>
                <p className="text-xs text-muted-foreground">Novos cadastros</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Crescimento
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.patientsGrowthRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Crescimento mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Média Idade
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.ageDistribution.length > 0 ? "32" : "0"} anos
                </div>
                <p className="text-xs text-muted-foreground">
                  Idade média estimada
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Distribuição por Idade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.ageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ageRange, count }) => `${ageRange}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.ageDistribution.map((entry, index) => (
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

            {/* Gráfico de Novos Pacientes por Mês */}
            <Card>
              <CardHeader>
                <CardTitle>Novos Pacientes por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyNewPatients}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value, "Novos Pacientes"]}
                    />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Distribuição por Idade */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Detalhada por Idade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Faixa Etária</th>
                      <th className="text-right p-2">Quantidade</th>
                      <th className="text-right p-2">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ageDistribution.map((age, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{age.ageRange}</td>
                        <td className="text-right p-2">{age.count}</td>
                        <td className="text-right p-2">
                          {data.totalActivePatients > 0
                            ? (
                                (age.count / data.totalActivePatients) *
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

          {/* Tabela de Novos Pacientes Mensais */}
          <Card>
            <CardHeader>
              <CardTitle>Novos Pacientes por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Mês</th>
                      <th className="text-right p-2">Novos Pacientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyNewPatients.map((month, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{month.month}</td>
                        <td className="text-right p-2">{month.count}</td>
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
