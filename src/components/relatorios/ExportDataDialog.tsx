import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileSpreadsheet, Database } from "lucide-react";
import { reportService } from "@/services/reportService";
import { exportUtils } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DataType = "producao" | "pacientes" | "consultas" | "all";

export const ExportDataDialog = ({
  open,
  onOpenChange,
}: ExportDataDialogProps) => {
  const [dataTypes, setDataTypes] = useState<DataType[]>(["all"]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDataTypeChange = (type: DataType, checked: boolean) => {
    if (type === "all") {
      if (checked) {
        setDataTypes(["all"]);
      } else {
        setDataTypes([]);
      }
    } else {
      if (checked) {
        setDataTypes((prev) => prev.filter((t) => t !== "all").concat(type));
      } else {
        setDataTypes((prev) => prev.filter((t) => t !== type));
      }
    }
  };

  const isDataTypeSelected = (type: DataType) => {
    return dataTypes.includes("all") || dataTypes.includes(type);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const selectedTypes = dataTypes.includes("all")
        ? (["producao", "pacientes", "consultas"] as DataType[])
        : (dataTypes.filter((t) => t !== "all") as DataType[]);

      for (const type of selectedTypes) {
        switch (type) {
          case "producao": {
            const productionData =
              await reportService.getClinicProductionReport();
            exportUtils.exportClinicProductionToExcel(productionData);
            break;
          }

          case "pacientes": {
            const patientData = await reportService.getPatientReport();
            exportUtils.exportPatientReportToExcel(patientData);
            break;
          }

          case "consultas": {
            const appointmentData = await reportService.getAppointmentReport();
            exportUtils.exportAppointmentReportToExcel(appointmentData);
            break;
          }
        }
      }

      toast({
        title: "Sucesso",
        description: "Relatórios exportados em Excel com sucesso!",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar os relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-green-600" />
            <div>
              <DialogTitle>Exportar Dados para Excel</DialogTitle>
              <DialogDescription>
                Escolha os dados que deseja exportar em formato Excel (.xlsx)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Dados para Exportar (Excel)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all"
                  checked={dataTypes.includes("all")}
                  onCheckedChange={(checked) =>
                    handleDataTypeChange("all", checked as boolean)
                  }
                />
                <Label
                  htmlFor="all"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Database className="h-4 w-4 text-blue-600" />
                  Todos os Relatórios
                </Label>
              </div>

              <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="producao"
                    checked={isDataTypeSelected("producao")}
                    onCheckedChange={(checked) =>
                      handleDataTypeChange("producao", checked as boolean)
                    }
                    disabled={dataTypes.includes("all")}
                  />
                  <Label htmlFor="producao" className="cursor-pointer text-sm">
                    Produção da Clínica
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pacientes"
                    checked={isDataTypeSelected("pacientes")}
                    onCheckedChange={(checked) =>
                      handleDataTypeChange("pacientes", checked as boolean)
                    }
                    disabled={dataTypes.includes("all")}
                  />
                  <Label htmlFor="pacientes" className="cursor-pointer text-sm">
                    Relatório de Pacientes
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consultas"
                    checked={isDataTypeSelected("consultas")}
                    onCheckedChange={(checked) =>
                      handleDataTypeChange("consultas", checked as boolean)
                    }
                    disabled={dataTypes.includes("all")}
                  />
                  <Label htmlFor="consultas" className="cursor-pointer text-sm">
                    Consultas & Agenda
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleExport}
              disabled={dataTypes.length === 0 || loading}
              className="flex-1 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
