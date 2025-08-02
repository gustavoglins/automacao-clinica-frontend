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
import { Download, Users } from "lucide-react";
import { reportService, type PatientReport } from "@/services/reportService";
import { exportUtils } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface PatientReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const handleExportPDF = async () => {
    if (data) {
      try {
        console.log("Iniciando exportação PDF...", data);
        exportUtils.exportPatientReportToPDF(data);
        toast({
          title: "Sucesso",
          description: "Relatório exportado para PDF com sucesso!",
        });
      } catch (error) {
        console.error("Erro na exportação PDF:", error);
        toast({
          title: "Erro",
          description: `Falha ao exportar: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`,
          variant: "destructive",
        });
      }
    }
  };

  const handleExportExcel = async () => {
    if (data) {
      try {
        exportUtils.exportPatientReportToExcel(data);
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
                      <td className="p-2">Total de Pacientes Cadastrados</td>
                      <td className="text-right p-2">
                        {data.totalRegisteredPatients}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Novos Pacientes (Este Mês)</td>
                      <td className="text-right p-2">
                        {data.newPatientsThisMonth}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Taxa de Crescimento</td>
                      <td className="text-right p-2">
                        {data.patientsGrowthRate.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Distribuição por Idade */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Faixa Etária</CardTitle>
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
                          {data.totalRegisteredPatients > 0
                            ? (
                                (age.count / data.totalRegisteredPatients) *
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

          {/* Novos Pacientes por Mês */}
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
            {/* <Button
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button> */}
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
