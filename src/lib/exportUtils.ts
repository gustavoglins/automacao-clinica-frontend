import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type {
  ClinicProductionReport,
  PatientReport,
  AppointmentReport,
} from '@/services/reportService';

// Declare autoTable method for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

export const exportUtils = {
  // Exportação de Relatório de Produção da Clínica
  exportClinicProductionToPDF: (data: ClinicProductionReport) => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Produção da Clínica', 20, 20);

      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

      // Resumo geral
      doc.setFontSize(14);
      doc.text('Resumo Geral', 20, 45);

      doc.setFontSize(12);
      doc.text(
        `Total de Consultas Realizadas: ${data.totalAppointments}`,
        20,
        55
      );
      doc.text(`Faturamento Total: R$ ${data.totalRevenue.toFixed(2)}`, 20, 65);
      doc.text(
        `Valor Médio por Consulta: R$ ${data.averageAppointmentValue.toFixed(
          2
        )}`,
        20,
        75
      );

      // Tabela de dados mensais
      doc.autoTable({
        startY: 90,
        head: [['Mês', 'Consultas', 'Faturamento']],
        body: data.monthlyData.map((item) => [
          item.month,
          item.appointments.toString(),
          `R$ ${item.revenue.toFixed(2)}`,
        ]),
      });

      // Tabela de serviços por categoria
      const finalY =
        (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? 110;
      doc.text('Serviços por Categoria', 20, finalY + 20);
      doc.autoTable({
        startY: finalY + 30,
        head: [['Categoria', 'Quantidade', 'Faturamento']],
        body: data.servicesByCategory.map((item) => [
          item.category,
          item.count.toString(),
          `R$ ${item.revenue.toFixed(2)}`,
        ]),
      });

      doc.save('relatorio-producao-clinica.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF de produção:', error);
      throw new Error('Falha ao gerar o PDF de produção da clínica');
    }
  },

  exportClinicProductionToExcel: (data: ClinicProductionReport) => {
    try {
      // Dados gerais
      const generalData = [
        ['Métrica', 'Valor'],
        ['Total de Consultas', data.totalAppointments],
        ['Faturamento Total', `R$ ${data.totalRevenue.toFixed(2)}`],
        [
          'Valor Médio por Consulta',
          `R$ ${data.averageAppointmentValue.toFixed(2)}`,
        ],
      ];

      // Dados mensais
      const monthlyHeaders = ['Mês', 'Consultas', 'Faturamento'];
      const monthlyData = data.monthlyData.map((item) => [
        item.month,
        item.appointments,
        item.revenue,
      ]);

      // Dados por categoria
      const categoryHeaders = ['Categoria', 'Quantidade', 'Faturamento'];
      const categoryData = data.servicesByCategory.map((item) => [
        item.category,
        item.count,
        item.revenue,
      ]);

      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Aba resumo
      const ws1 = XLSX.utils.aoa_to_sheet(generalData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

      // Aba dados mensais
      const ws2 = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyData]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Dados Mensais');

      // Aba por categoria
      const ws3 = XLSX.utils.aoa_to_sheet([categoryHeaders, ...categoryData]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Por Categoria');

      // Salvar
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'relatorio-producao-clinica.xlsx');
    } catch (error) {
      console.error('Erro ao gerar Excel de produção:', error);
      throw new Error('Falha ao gerar o Excel de produção da clínica');
    }
  },

  // Exportação de Relatório de Pacientes
  exportPatientReportToPDF: (data: PatientReport) => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Pacientes', 20, 20);

      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

      // Resumo geral
      doc.setFontSize(14);
      doc.text('Resumo Geral', 20, 45);

      doc.setFontSize(12);
      doc.text(
        `Total de Pacientes Cadastrados: ${data.totalRegisteredPatients}`,
        20,
        55
      );
      doc.text(
        `Novos Pacientes (Este Mês): ${data.newPatientsThisMonth}`,
        20,
        65
      );
      doc.text(
        `Taxa de Crescimento: ${data.patientsGrowthRate.toFixed(2)}%`,
        20,
        75
      );

      // Distribuição por idade
      if (data.ageDistribution && data.ageDistribution.length > 0) {
        doc.autoTable({
          startY: 90,
          head: [['Faixa Etária', 'Quantidade']],
          body: data.ageDistribution.map((item) => [
            item.ageRange,
            item.count.toString(),
          ]),
        });
      }

      // Novos pacientes por mês
      if (data.monthlyNewPatients && data.monthlyNewPatients.length > 0) {
        const finalY =
          (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
            ?.finalY ?? 110;
        doc.text('Novos Pacientes por Mês', 20, finalY + 20);
        doc.autoTable({
          startY: finalY + 30,
          head: [['Mês', 'Novos Pacientes']],
          body: data.monthlyNewPatients.map((item) => [
            item.month,
            item.count.toString(),
          ]),
        });
      }

      doc.save('relatorio-pacientes.pdf');
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF de pacientes:', error);
      throw new Error(
        `Falha ao gerar o PDF de pacientes: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      );
    }
  },

  exportPatientReportToExcel: (data: PatientReport) => {
    try {
      const generalData = [
        ['Métrica', 'Valor'],
        ['Total de Pacientes Cadastrados', data.totalRegisteredPatients],
        ['Novos Pacientes (Este Mês)', data.newPatientsThisMonth],
        ['Taxa de Crescimento (%)', data.patientsGrowthRate.toFixed(2)],
      ];

      const ageHeaders = ['Faixa Etária', 'Quantidade'];
      const ageData = data.ageDistribution.map((item) => [
        item.ageRange,
        item.count,
      ]);

      const monthlyHeaders = ['Mês', 'Novos Pacientes'];
      const monthlyData = data.monthlyNewPatients.map((item) => [
        item.month,
        item.count,
      ]);

      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.aoa_to_sheet(generalData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

      const ws2 = XLSX.utils.aoa_to_sheet([ageHeaders, ...ageData]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Por Idade');

      const ws3 = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyData]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Mensais');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'relatorio-pacientes.xlsx');
    } catch (error) {
      console.error('Erro ao gerar Excel de pacientes:', error);
      throw new Error('Falha ao gerar o Excel de pacientes');
    }
  },

  // Exportação de Relatório de Consultas
  exportAppointmentReportToPDF: (data: AppointmentReport) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text('Relatório de Consultas & Agenda', 20, 20);

      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

      doc.setFontSize(14);
      doc.text('Resumo Geral', 20, 45);

      doc.setFontSize(12);
      doc.text(`Total de Consultas: ${data.totalAppointments}`, 20, 55);
      doc.text(`Consultas Confirmadas: ${data.confirmedAppointments}`, 20, 65);
      doc.text(`Consultas Canceladas: ${data.canceledAppointments}`, 20, 75);
      doc.text(
        `Taxa de Comparecimento: ${data.attendanceRate.toFixed(2)}%`,
        20,
        85
      );
      doc.text(`Taxa de Falta: ${data.noShowRate.toFixed(2)}%`, 20, 95);

      // Horários mais movimentados
      doc.autoTable({
        startY: 110,
        head: [['Horário', 'Quantidade de Consultas']],
        body: data.busyHours.map((item) => [item.hour, item.count.toString()]),
      });

      // Status das consultas
      const finalY =
        (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? 130;
      doc.text('Distribuição por Status', 20, finalY + 20);
      doc.autoTable({
        startY: finalY + 30,
        head: [['Status', 'Quantidade', 'Percentual']],
        body: data.statusDistribution.map((item) => [
          item.status,
          item.count.toString(),
          `${item.percentage.toFixed(2)}%`,
        ]),
      });

      doc.save('relatorio-consultas.pdf');
    } catch (error) {
      console.error('Erro ao gerar PDF de consultas:', error);
      throw new Error('Falha ao gerar o PDF de consultas');
    }
  },

  exportAppointmentReportToExcel: (data: AppointmentReport) => {
    try {
      const generalData = [
        ['Métrica', 'Valor'],
        ['Total de Consultas', data.totalAppointments],
        ['Consultas Confirmadas', data.confirmedAppointments],
        ['Consultas Canceladas', data.canceledAppointments],
        ['Taxa de Comparecimento (%)', data.attendanceRate.toFixed(2)],
        ['Taxa de Falta (%)', data.noShowRate.toFixed(2)],
      ];

      const busyHoursHeaders = ['Horário', 'Quantidade'];
      const busyHoursData = data.busyHours.map((item) => [
        item.hour,
        item.count,
      ]);

      const statusHeaders = ['Status', 'Quantidade', 'Percentual'];
      const statusData = data.statusDistribution.map((item) => [
        item.status,
        item.count,
        `${item.percentage.toFixed(2)}%`,
      ]);

      const monthlyHeaders = ['Mês', 'Total', 'Confirmadas', 'Canceladas'];
      const monthlyData = data.monthlyAppointments.map((item) => [
        item.month,
        item.total,
        item.confirmed,
        item.canceled,
      ]);

      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.aoa_to_sheet(generalData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

      const ws2 = XLSX.utils.aoa_to_sheet([busyHoursHeaders, ...busyHoursData]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Horários Movimentados');

      const ws3 = XLSX.utils.aoa_to_sheet([statusHeaders, ...statusData]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Por Status');

      const ws4 = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyData]);
      XLSX.utils.book_append_sheet(wb, ws4, 'Dados Mensais');

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, 'relatorio-consultas.xlsx');
    } catch (error) {
      console.error('Erro ao gerar Excel de consultas:', error);
      throw new Error('Falha ao gerar o Excel de consultas');
    }
  },
};
