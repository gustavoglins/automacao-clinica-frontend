import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, Calendar } from "lucide-react";

const Relatorios = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-4 text-left">Relatórios</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <FileText className="text-[#2563eb]" />
              <CardTitle>Produção da Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Veja o relatório de produção geral da clínica, incluindo faturamento, atendimentos e evolução mensal.</p>
              <Button variant="primary" className="w-full">Ver relatório</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Users className="text-[#2563eb]" />
              <CardTitle>Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Relatório detalhado de pacientes ativos, novos cadastros e evolução do quadro de pacientes.</p>
              <Button variant="primary" className="w-full">Ver relatório</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Calendar className="text-[#2563eb]" />
              <CardTitle>Consultas & Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Acompanhe o histórico de consultas, taxa de comparecimento e horários mais movimentados.</p>
              <Button variant="primary" className="w-full">Ver relatório</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Download className="text-[#2563eb]" />
              <CardTitle>Exportar Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Exporte relatórios em PDF, Excel ou CSV para análise externa e backups.</p>
              <Button variant="outline-primary" className="w-full">Exportar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Relatorios;
