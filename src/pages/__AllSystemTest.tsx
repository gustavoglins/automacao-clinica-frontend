import React, { useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { convenioService } from '@/services/convenioService';
import { clinicAddressService } from '@/services/clinicAddressService';
import { clinicHoursService } from '@/services/clinicHoursService';
import { supabase } from '@/lib/supabaseClient';

/**
 * Página interna para testar operações do sistema.
 * - Acessar via /__all-tests (não há link no header)
 * - Modo Seguro: apenas leituras e estatísticas
 * - Modo Completo: cria, atualiza e remove registros temporários
 */
const AllSystemTest: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const add = (msg: string) =>
    setLog((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setLog([]);
    add('Iniciando bateria de testes...');

    try {
      // Autenticação: verificar usuário atual
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      add(
        user
          ? `Usuário autenticado: ${user.email}`
          : 'Nenhum usuário autenticado'
      );

      // Pacientes
      add('Carregando pacientes...');
      const patients = await patientService.getAllPatients();
      add(`Pacientes: ${patients.length}`);

      // Funcionários
      add('Carregando funcionários...');
      const employees = await employeeService.getAllEmployees();
      add(`Funcionários: ${employees.length}`);

      // Serviços
      add('Carregando serviços...');
      const services = await serviceService.getAllServices();
      add(`Serviços: ${services.length}`);

      // Convênios
      add('Carregando convênios...');
      const convenios = await convenioService.getAll();
      add(`Convênios: ${convenios.length}`);

      // Endereços da clínica
      add('Carregando endereços da clínica...');
      const enderecos = await clinicAddressService.getAllAddresses();
      add(`Endereços: ${enderecos.length}`);

      // Horários da clínica
      add('Carregando horários da clínica...');
      const horas = await clinicHoursService.getAllClinicHours();
      add(`Dias com configuração: ${horas.length}`);
      if (horas.length) {
        const firstOpen = horas.find(
          (h) => h.isOpen && h.openTime && h.closeTime
        );
        if (firstOpen) {
          const slots = clinicHoursService.generateTimeSlots(
            firstOpen.openTime!,
            firstOpen.closeTime!
          );
          add(
            `Slots gerados para ${firstOpen.dayOfWeek}: ${slots
              .slice(0, 5)
              .join(', ')}${slots.length > 5 ? ' ...' : ''}`
          );
        }
      }

      // Agendamentos
      add('Carregando agendamentos...');
      const appointments = await appointmentService.getAllAppointments();
      add(`Agendamentos: ${appointments.length}`);

      // Estatísticas
      add('Coletando estatísticas...');
      const [patientStats, employeeStats, serviceStats, appointmentStats] =
        await Promise.all([
          patientService.getPatientStats().catch((e) => {
            add('Erro stats pacientes');
            throw e;
          }),
          employeeService.getEmployeeStats().catch((e) => {
            add('Erro stats funcionários');
            throw e;
          }),
          serviceService.getServiceStats().catch((e) => {
            add('Erro stats serviços');
            throw e;
          }),
          appointmentService.getAppointmentStats().catch((e) => {
            add('Erro stats agendamentos');
            throw e;
          }),
        ]);
      add(
        `Stats pacientes: total=${patientStats.total} ativos=${patientStats.active}`
      );
      add(`Stats funcionários: total=${employeeStats.total}`);
      add(
        `Stats serviços: total=${serviceStats.total} ativos=${serviceStats.active}`
      );
      add(
        `Stats agendamentos: total=${appointmentStats.total} hoje=${appointmentStats.today}`
      );

      if (fullMode) {
        add('--- INICIANDO TESTES CRUD (modo completo) ---');
        // Armazenar IDs para limpeza
        let tempPatientId: string | null = null;
        let tempEmployeeId: string | null = null;
        let tempServiceId: number | null = null;
        let tempConvenioId: number | null = null;
        let tempAppointmentId: string | null = null;

        try {
          // Criar Paciente
          const novoPaciente = await patientService.createPatient({
            fullName: 'Paciente Teste __AUTO__',
            cpf: `${Date.now()}`.slice(-11).padStart(11, '0'),
            birthDate: '1990-01-01',
            phone: '11999999999',
            email: `teste_${Date.now()}@exemplo.com`,
          });
          tempPatientId = novoPaciente.id;
          add(`Paciente criado: ${tempPatientId}`);
          await patientService.updatePatient({
            id: tempPatientId,
            fullName: 'Paciente Teste (UPD)',
          });
          add('Paciente atualizado');

          // Criar Funcionário
          const novoFuncionario = await employeeService.createEmployee({
            fullName: 'Funcionario Teste __AUTO__',
            cpf: `${Date.now()}`.slice(-11).padStart(11, '0'),
            role: 'Dentista',
            status: 'ativo',
            hiredAt: new Date().toISOString().split('T')[0],
            phone: '11988887777',
            email: `func_${Date.now()}@exemplo.com`,
          });
          tempEmployeeId = novoFuncionario.id;
          add(`Funcionário criado: ${tempEmployeeId}`);
          await employeeService.updateEmployee({
            id: tempEmployeeId,
            fullName: 'Funcionario Teste (UPD)',
          });
          add('Funcionário atualizado');

          // Criar Serviço
          const novoServico = await serviceService.createService({
            name: 'Serviço Teste __AUTO__',
            category: 'outros',
            durationMinutes: 30,
            price: 123.45,
            active: true,
          });
          tempServiceId = novoServico.id;
          add(`Serviço criado: ${tempServiceId}`);
          await serviceService.updateService({ id: tempServiceId, price: 150 });
          add('Serviço atualizado');

          // Criar Convênio
          const novoConvenio = await convenioService.create({
            nome: 'Convenio Teste __AUTO__',
            abrangencia: 'Nacional',
            tipo_cobertura: 'total',
            telefone_contato: '1133334444',
            email_contato: `conv_${Date.now()}@exemplo.com`,
            observacoes: 'Registro temporário',
            ativo: true,
          });
          tempConvenioId = novoConvenio.id;
          add(`Convênio criado: ${tempConvenioId}`);
          await convenioService.update({
            id: tempConvenioId,
            observacoes: 'Atualizado',
          });
          add('Convênio atualizado');

          // Criar Agendamento (requer paciente, funcionário, serviço)
          if (tempPatientId && tempEmployeeId && tempServiceId !== null) {
            const start = new Date(Date.now() + 60 * 60 * 1000); // +1h
            const end = new Date(start.getTime() + 30 * 60 * 1000);
            const novoAgendamento = await appointmentService.createAppointment({
              patientId: tempPatientId,
              employeeId: tempEmployeeId,
              serviceId: tempServiceId,
              appointmentAt: start.toISOString(),
              appointmentEnd: end.toISOString(),
              status: undefined,
            });
            tempAppointmentId = novoAgendamento.id;
            add(`Agendamento criado: ${tempAppointmentId}`);
            await appointmentService.updateAppointment({
              id: tempAppointmentId,
              appointmentEnd: new Date(
                end.getTime() + 15 * 60000
              ).toISOString(),
            });
            add('Agendamento atualizado');
          } else {
            add('⚠️ Não foi possível criar agendamento (IDs faltando)');
          }

          add('Limpando registros temporários...');
          if (tempAppointmentId) {
            await appointmentService.deleteAppointment(tempAppointmentId);
            add('Agendamento removido');
          }
          if (tempConvenioId !== null) {
            await convenioService.delete(tempConvenioId);
            add('Convênio removido');
          }
          if (tempServiceId !== null) {
            await serviceService.deleteService(tempServiceId);
            add('Serviço removido');
          }
          if (tempEmployeeId) {
            await employeeService.deleteEmployee(tempEmployeeId);
            add('Funcionário removido');
          }
          if (tempPatientId) {
            await patientService.deletePatient(tempPatientId);
            add('Paciente removido');
          }

          add('CRUD temporário concluído ✅');
        } catch (crudError) {
          console.error(crudError);
          add('Erro durante CRUD completo (alguns registros podem ter ficado)');
        }
      }

      add('Testes concluídos ✅');
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      add(`Erro: ${msg}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Teste Completo do Sistema</h1>
      <p>
        Esta página executa chamadas aos principais serviços. Use Modo Completo
        apenas em ambiente de teste (cria e apaga registros temporários).
      </p>
      <label style={{ display: 'block', margin: '12px 0' }}>
        <input
          type="checkbox"
          checked={fullMode}
          onChange={(e) => setFullMode(e.target.checked)}
          disabled={running}
        />{' '}
        Modo completo (CRUD)
      </label>
      <button
        onClick={run}
        disabled={running}
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          color: '#fff',
          borderRadius: 4,
        }}
      >
        {running
          ? 'Executando...'
          : fullMode
          ? 'Rodar Testes (Completo)'
          : 'Rodar Testes (Seguro)'}
      </button>
      <div
        style={{
          marginTop: 24,
          maxHeight: 400,
          overflow: 'auto',
          background: '#111',
          color: '#0f0',
          padding: 12,
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      >
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

export default AllSystemTest;
