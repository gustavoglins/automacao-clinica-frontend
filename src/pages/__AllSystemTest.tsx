import React, { useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { convenioService } from '@/services/convenioService';
import { clinicAddressService } from '@/services/clinicAddressService';
import { clinicHoursService } from '@/services/clinicHoursService';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

/**
 * Página interna para testar operações do sistema.
 * - Acessar via /__all-tests (não há link no header)
 * - Modo Seguro: apenas leituras e estatísticas
 * - Modo Completo: cria, atualiza e remove registros temporários
 */
// Proteção simples por senha (nota: qualquer segredo no front-end é visível no bundle;
// usar variável de ambiente quando possível: defina VITE_ALL_SYSTEM_TEST_PASSWORD em .env.local)
const REQUIRED_TEST_PASSWORD = import.meta.env.VITE_ALL_SYSTEM_TEST_PASSWORD;

const AllSystemTest: React.FC = () => {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [fullMode, setFullMode] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const add = (msg: string) =>
    setLog((l) => [...l, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const run = async () => {
    if (!unlocked) return; // segurança adicional
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

  // Tela de bloqueio por senha
  if (!unlocked) {
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
        <div className="relative overflow-hidden rounded-lg border border-red-300/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-5 py-4 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.18),transparent_60%)]" />
          <div className="relative flex gap-4">
            <div className="h-8 w-14 p-6 text-[2rem] flex items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white font-bold shadow-inner shadow-red-900/30 ring-4 ring-red-400/10">
              !
            </div>
            <div className="space-y-1">
              <p className="text-sm leading-relaxed text-red-50/90">
                <span className="font-semibold tracking-wide text-red-300">
                  AVISO CRÍTICO:
                </span>{' '}
                {/* Esta página executa operações reais. Utilize apenas em ambiente
                autorizado. Todos os registros criados são temporários e serão
                removidos no final do teste completo. */}
                As operações realizadas nesta página podem comprometer dados,
                configurações, o funcionamento do sistema, o agente de
                inteligência artificial ou outros serviços.{' '}
                <b>
                  A Norvand Tecnologia LTDA não se responsabiliza por quaisquer
                  consequências decorrentes do uso indevido ou incorreto das
                  funcionalidades aqui disponíveis
                </b>
                . Recomenda-se que apenas desenvolvedores e especialistas da
                Norvand utilizem as funções desta página.
              </p>
            </div>
          </div>
        </div>
        <br />
        <hr />
        <hr />
        <hr />
        <hr />
        <hr />
        <br />
        <h1>Área Restrita de Testes</h1>
        <p style={{ maxWidth: 640, lineHeight: 1.5 }}>
          Esta página executa operações diretas nos serviços do sistema. O
          acesso é restrito. Insira a senha de autorização para continuar. (As
          ações podem criar e remover registros temporários.)
        </p>
        <div style={{ marginTop: 24 }}>
          <input
            type="password"
            placeholder="Senha de autorização"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #444',
              borderRadius: 4,
              minWidth: 320,
              background: '#111',
              color: '#eee',
              fontFamily: 'monospace',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (password === REQUIRED_TEST_PASSWORD) {
                  setUnlocked(true);
                  setPassword('');
                }
              }
            }}
          />{' '}
          <button
            onClick={() => {
              if (password === REQUIRED_TEST_PASSWORD) {
                setUnlocked(true);
                setPassword('');
              }
            }}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: 4,
              fontWeight: 600,
              marginLeft: 8,
            }}
          >
            Entrar
          </button>
          {password && password !== REQUIRED_TEST_PASSWORD && (
            <div style={{ color: '#f87171', marginTop: 8, fontSize: 12 }}>
              Senha incorreta
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <div className="relative overflow-hidden rounded-lg border border-red-300/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-5 py-4 shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.18),transparent_60%)]" />
        <div className="relative flex gap-4">
          <div className="h-8 w-14 p-6 text-[2rem] flex items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white font-bold shadow-inner shadow-red-900/30 ring-4 ring-red-400/10">
            !
          </div>
          <div className="space-y-1">
            <p className="text-sm leading-relaxed text-red-50/90">
              <span className="font-semibold tracking-wide text-red-300">
                AVISO CRÍTICO:
              </span>{' '}
              {/* Esta página executa operações reais. Utilize apenas em ambiente
                autorizado. Todos os registros criados são temporários e serão
                removidos no final do teste completo. */}
              As operações realizadas nesta página podem comprometer dados,
              configurações, o funcionamento do sistema, o agente de
              inteligência artificial ou outros serviços.{' '}
              <b>
                A Norvand Tecnologia LTDA não se responsabiliza por quaisquer
                consequências decorrentes do uso indevido ou incorreto das
                funcionalidades aqui disponíveis
              </b>
              . Recomenda-se que apenas desenvolvedores e especialistas da
              Norvand utilizem as funções desta página.
            </p>
          </div>
        </div>
      </div>
      <br />
      <hr />
      <hr />
      <hr />
      <hr />
      <hr />
      <div style={{ marginTop: 12, fontSize: 12, color: 'red' }}>
        Sessão autorizada!{' '}
        <Button
          style={{ textDecoration: 'underline' }}
          onClick={() => setUnlocked(false)}
          variant="danger"
          size="xs"
        >
          Bloquear novamente
        </Button>
      </div>
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
        onClick={() => setConfirmOpen(true)}
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
          height: 580,
          maxHeight: 580,
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
      <Dialog
        open={confirmOpen}
        onOpenChange={(o) => !running && setConfirmOpen(o)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar Execução</DialogTitle>
            <DialogDescription>
              Você está prestes a iniciar a bateria de testes
              {fullMode
                ? ' em MODO COMPLETO (CRUD)'
                : ' em modo seguro (somente leitura)'}
              .
              {fullMode &&
                ' Serão criados registros temporários que depois serão removidos.'}
              <p></p>
              Confirma a execução agora?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <b>Status:</b> {running ? 'Executando' : 'Pronto'}
            </p>
            {fullMode && (
              <p className="text-red-500 font-medium">
                Atenção: operações de criação, atualização e remoção serão
                realizadas.
              </p>
            )}
          </div>
          <DialogFooter className="mt-6 gap-2">
            <DialogClose asChild>
              <Button variant="classic" disabled={running}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant={fullMode ? 'danger' : 'default'}
              disabled={running}
              onClick={() => {
                setConfirmOpen(false);
                run();
              }}
            >
              {running ? 'Executando...' : 'Confirmar e Executar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllSystemTest;
