import React, { useRef, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { employeeService } from '@/services/employeeService';
import { serviceService } from '@/services/servicesService';
import { convenioService } from '@/services/convenioService';
import { clinicAddressService } from '@/services/clinicAddressService';
import { clinicHoursService } from '@/services/clinicHoursService';
import { closureService } from '@/services/closureService';
import { paymentMethodService } from '@/services/paymentMethodService';
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

  // Helpers de logging detalhado
  const preview = (v: unknown, max = 600) => {
    try {
      const s = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
      return s.length > max ? s.slice(0, max) + '…' : s;
    } catch {
      return String(v);
    }
  };

  // Monitoramento de rede (fetch) para capturar método/URL/status/tempo
  type NetLog = {
    t: string; // horário
    method: string;
    url: string;
    status?: number;
    statusText?: string;
    durationMs?: number;
    ok?: boolean;
  };
  const originalFetchRef = useRef<typeof window.fetch | null>(null);
  const netBufferRef = useRef<NetLog[]>([]);
  const netActiveRef = useRef(false);

  const shortUrl = (u: string, max = 140) => {
    try {
      const url = new URL(u);
      const s = `${url.hostname}${url.pathname}${url.search}`;
      return s.length > max ? s.slice(0, max) + '…' : s;
    } catch {
      return u.length > max ? u.slice(0, max) + '…' : u;
    }
  };

  const enableNetMonitor = () => {
    if (netActiveRef.current) return;
    originalFetchRef.current = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const started = Date.now();
      const method = (
        init?.method ||
        (typeof input === 'object' && 'method' in (input as Request)
          ? (input as Request).method
          : 'GET') ||
        'GET'
      ).toUpperCase();
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : (input as Request).url;
      try {
        const res = await originalFetchRef.current!(input as RequestInfo, init);
        netBufferRef.current.push({
          t: new Date().toLocaleTimeString(),
          method,
          url: urlStr,
          status: res.status,
          statusText: res.statusText,
          durationMs: Date.now() - started,
          ok: res.ok,
        });
        return res;
      } catch (e) {
        netBufferRef.current.push({
          t: new Date().toLocaleTimeString(),
          method,
          url: urlStr,
          status: undefined,
          statusText: e instanceof Error ? e.message : undefined,
          durationMs: Date.now() - started,
          ok: false,
        });
        throw e;
      }
    };
    netActiveRef.current = true;
    add('🌐 Network monitor ativado (fetch interceptado)');
  };

  const disableNetMonitor = () => {
    if (!netActiveRef.current) return;
    if (originalFetchRef.current) {
      window.fetch = originalFetchRef.current;
      originalFetchRef.current = null;
    }
    netActiveRef.current = false;
    add('🌐 Network monitor desativado');
  };

  const flushNetLogs = (prefix = 'HTTP') => {
    if (!netBufferRef.current.length) return;
    const logs = netBufferRef.current.splice(0, netBufferRef.current.length);
    for (const n of logs) {
      const status =
        n.status !== undefined
          ? `${n.status}${n.statusText ? ' ' + n.statusText : ''}`
          : 'erro';
      add(
        `${prefix}: ${n.method} ${shortUrl(n.url)} -> ${status} (${
          n.durationMs
        }ms)`
      );
    }
  };

  const timed = async <T,>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T | undefined> => {
    const start = Date.now();
    add(`▶ ${label} | iniciando`);
    try {
      const res = await fn();
      add(`✅ ${label} | ok em ${Date.now() - start}ms`);
      flushNetLogs(label);
      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : preview(e);
      add(`❌ ${label} | erro em ${Date.now() - start}ms -> ${msg}`);
      flushNetLogs(label);
      return undefined;
    }
  };

  // Define a cor por linha do log (erros em vermelho, avisos em amarelo)
  const getLogColor = (line: string): string => {
    // Erros explícitos
    if (/❌|\berro\b/i.test(line)) return '#f87171'; // vermelho
    // Avisos
    if (/⚠️|atenção|warning/i.test(line)) return '#f59e0b'; // amarelo
    // HTTP status
    if (/HTTP:/i.test(line)) {
      const m = line.match(/->\s+(\d{3})/);
      if (m) {
        const code = parseInt(m[1], 10);
        if (code >= 500) return '#ef4444'; // vermelho forte
        if (code >= 400) return '#f87171'; // vermelho
        if (code >= 300) return '#f59e0b'; // amarelo
      }
      // Falha sem status (ex.: network error)
      if (/->\s+erro/i.test(line)) return '#f87171';
    }
    // Sucesso/infos
    return '#22c55e'; // verde
  };

  const run = async () => {
    if (!unlocked) return; // segurança adicional
    if (running) return;
    setRunning(true);
    setLog([]);
    const runStart = Date.now();
    enableNetMonitor();
    add('============================================================');
    add(
      `Iniciando bateria de testes | modo=${
        fullMode ? 'COMPLETO' : 'SEGURO'
      } | ${new Date().toLocaleString()}`
    );
    add('============================================================');

    try {
      // Autenticação: verificar usuário atual
      const auth = await timed('Auth: obter usuário', async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return data.user;
      });
      if (auth) {
        add(`Auth: usuário=${auth.email ?? auth.id}`);
        add(`Auth raw: ${preview(auth)}`);
      } else {
        add('Auth: usuário não autenticado ou falha ao obter');
      }

      // Pacientes
      const patients = await timed('Pacientes: listar', () =>
        patientService.getAllPatients()
      );
      if (patients) {
        add(`Pacientes: count=${patients.length}`);
        if (patients.length) add(`Pacientes[0]: ${preview(patients[0])}`);
      }

      // Funcionários
      const employees = await timed('Funcionários: listar', () =>
        employeeService.getAllEmployees()
      );
      if (employees) {
        add(`Funcionários: count=${employees.length}`);
        if (employees.length) add(`Funcionários[0]: ${preview(employees[0])}`);
      }

      // Serviços
      const services = await timed('Serviços: listar', () =>
        serviceService.getAllServices()
      );
      if (services) {
        add(`Serviços: count=${services.length}`);
        if (services.length) add(`Serviços[0]: ${preview(services[0])}`);
      }

      // Convênios
      const convenios = await timed('Convênios: listar', () =>
        convenioService.getAll()
      );
      if (convenios) {
        add(`Convênios: count=${convenios.length}`);
        if (convenios.length) add(`Convênios[0]: ${preview(convenios[0])}`);
      }

      // Endereços da clínica
      const enderecos = await timed('Endereços da clínica: listar', () =>
        clinicAddressService.getAllAddresses()
      );
      if (enderecos) {
        add(`Endereços: count=${enderecos.length}`);
        if (enderecos.length) add(`Endereços[0]: ${preview(enderecos[0])}`);
      }

      // Horários da clínica
      const horas = await timed('Horários da clínica: listar', () =>
        clinicHoursService.getAllClinicHours()
      );
      if (horas) {
        add(`Dias com configuração: ${horas.length}`);
      }
      if (horas.length) {
        const firstOpen = horas.find(
          (h) => h.isOpen && h.openTime && h.closeTime
        );
        if (firstOpen) {
          const t0 = Date.now();
          add(
            `Gerando slots para ${firstOpen.dayOfWeek} (${firstOpen.openTime} - ${firstOpen.closeTime})`
          );
          const slots = clinicHoursService.generateTimeSlots(
            firstOpen.openTime!,
            firstOpen.closeTime!
          );
          add(
            `Slots gerados (${Date.now() - t0}ms): ${slots
              .slice(0, 8)
              .join(', ')}${slots.length > 8 ? ' ...' : ''}`
          );
        }
      }

      // Agendamentos
      const appointments = await timed('Agendamentos: listar', () =>
        appointmentService.getAllAppointments()
      );
      if (appointments) {
        add(`Agendamentos: count=${appointments.length}`);
        if (appointments.length)
          add(`Agendamentos[0]: ${preview(appointments[0])}`);
      }

      // Fechamentos da clínica
      const closures = await timed('Fechamentos: listar', () =>
        closureService.getAllClosures()
      );
      if (closures) {
        add(`Fechamentos: count=${closures.length}`);
        if (closures.length) add(`Fechamentos[0]: ${preview(closures[0])}`);
      }

      // Métodos de Pagamento
      const paymentMethods = await timed('Métodos de pagamento: listar', () =>
        paymentMethodService.getAll()
      );
      if (paymentMethods) {
        add(`Métodos de pagamento: count=${paymentMethods.length}`);
        if (paymentMethods.length) add(`PM[0]: ${preview(paymentMethods[0])}`);
      }

      // Estatísticas
      add('Coletando estatísticas (individualmente)...');
      const patientStats = await timed('Stats: pacientes', () =>
        patientService.getPatientStats()
      );
      if (patientStats)
        add(
          `Stats pacientes: total=${patientStats.total} ativos=${patientStats.active}`
        );
      const employeeStats = await timed('Stats: funcionários', () =>
        employeeService.getEmployeeStats()
      );
      if (employeeStats)
        add(`Stats funcionários: total=${employeeStats.total}`);
      const serviceStats = await timed('Stats: serviços', () =>
        serviceService.getServiceStats()
      );
      if (serviceStats)
        add(
          `Stats serviços: total=${serviceStats.total} ativos=${serviceStats.active}`
        );
      const appointmentStats = await timed('Stats: agendamentos', () =>
        appointmentService.getAppointmentStats()
      );
      if (appointmentStats)
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
        let tempClosureId: string | null = null;
        let tempPaymentMethodId: number | null = null;

        try {
          // Criar Paciente
          const novoPaciente = await timed('Paciente: criar', () =>
            patientService.createPatient({
              fullName: 'Paciente Teste __AUTO__',
              cpf: `${Date.now()}`.slice(-11).padStart(11, '0'),
              birthDate: '1990-01-01',
              phone: '11999999999',
              email: `teste_${Date.now()}@exemplo.com`,
            })
          );
          if (novoPaciente) {
            tempPatientId = novoPaciente.id;
            add(`Paciente criado: id=${tempPatientId}`);
            await timed('Paciente: atualizar', () =>
              patientService.updatePatient({
                id: tempPatientId!,
                fullName: 'Paciente Teste (UPD)',
              })
            );
          }

          // Criar Funcionário
          const novoFuncionario = await timed('Funcionário: criar', () =>
            employeeService.createEmployee({
              fullName: 'Funcionario Teste __AUTO__',
              cpf: `${Date.now()}`.slice(-11).padStart(11, '0'),
              role: 'Dentista',
              status: 'ativo',
              hiredAt: new Date().toISOString().split('T')[0],
              phone: '11988887777',
              email: `func_${Date.now()}@exemplo.com`,
            })
          );
          if (novoFuncionario) {
            tempEmployeeId = novoFuncionario.id;
            add(`Funcionário criado: id=${tempEmployeeId}`);
            await timed('Funcionário: atualizar', () =>
              employeeService.updateEmployee({
                id: tempEmployeeId!,
                fullName: 'Funcionario Teste (UPD)',
              })
            );
          }

          // Criar Serviço
          const novoServico = await timed('Serviço: criar', () =>
            serviceService.createService({
              name: 'Serviço Teste __AUTO__',
              category: 'outros',
              durationMinutes: 30,
              price: 123.45,
              active: true,
            })
          );
          if (novoServico) {
            tempServiceId = novoServico.id;
            add(`Serviço criado: id=${tempServiceId}`);
            await timed('Serviço: atualizar', () =>
              serviceService.updateService({ id: tempServiceId!, price: 150 })
            );
          }

          // Criar Convênio
          const novoConvenio = await timed('Convênio: criar', () =>
            convenioService.create({
              nome: 'Convenio Teste __AUTO__',
              abrangencia: 'Nacional',
              tipo_cobertura: 'total',
              telefone_contato: '1133334444',
              email_contato: `conv_${Date.now()}@exemplo.com`,
              observacoes: 'Registro temporário',
              ativo: true,
            })
          );
          if (novoConvenio) {
            tempConvenioId = novoConvenio.id;
            add(`Convênio criado: id=${tempConvenioId}`);
            await timed('Convênio: atualizar', () =>
              convenioService.update({
                id: tempConvenioId!,
                observacoes: 'Atualizado',
              })
            );
          }

          // Criar Agendamento (requer paciente, funcionário, serviço)
          if (tempPatientId && tempEmployeeId && tempServiceId !== null) {
            const start = new Date(Date.now() + 60 * 60 * 1000); // +1h
            const end = new Date(start.getTime() + 30 * 60 * 1000);
            const novoAgendamento = await timed('Agendamento: criar', () =>
              appointmentService.createAppointment({
                patientId: tempPatientId!,
                employeeId: tempEmployeeId!,
                serviceId: tempServiceId!,
                appointmentAt: start.toISOString(),
                appointmentEnd: end.toISOString(),
                status: undefined,
              })
            );
            if (novoAgendamento) {
              tempAppointmentId = novoAgendamento.id;
              add(`Agendamento criado: id=${tempAppointmentId}`);
              await timed('Agendamento: atualizar', () =>
                appointmentService.updateAppointment({
                  id: tempAppointmentId!,
                  appointmentEnd: new Date(
                    end.getTime() + 15 * 60000
                  ).toISOString(),
                })
              );
            }
          } else {
            add('⚠️ Não foi possível criar agendamento (IDs faltando)');
          }

          // Criar Fechamento
          const today = new Date();
          const endDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          const novoFechamento = await timed('Fechamento: criar', () =>
            closureService.createClosure({
              name: 'Fechamento Teste __AUTO__',
              description: 'Registro temporário',
              start_date: today.toISOString().split('T')[0],
              end_date: endDay.toISOString().split('T')[0],
              type: 'manutenção',
              is_recurring: false,
            })
          );
          if (novoFechamento) {
            tempClosureId = novoFechamento.id;
            add(`Fechamento criado: id=${tempClosureId}`);
            await timed('Fechamento: atualizar', () =>
              closureService.updateClosure({
                ...novoFechamento,
                description: 'Registro temporário (UPD)',
              })
            );
          }

          // Criar Método de Pagamento
          const novoMetodoPagamento = await timed(
            'Método de Pagamento: criar',
            () =>
              paymentMethodService.create({
                name: 'Método Pagamento Teste __AUTO__',
                description: 'Registro temporário',
                active: true,
              })
          );
          if (novoMetodoPagamento) {
            tempPaymentMethodId = novoMetodoPagamento.id;
            add(`Método de pagamento criado: id=${tempPaymentMethodId}`);
            await timed('Método de Pagamento: atualizar', () =>
              paymentMethodService.update({
                id: tempPaymentMethodId!,
                description: 'Registro temporário (UPD)',
              })
            );
          }

          add('Limpando registros temporários...');
          if (tempAppointmentId)
            await timed('Agendamento: remover', () =>
              appointmentService.deleteAppointment(tempAppointmentId!)
            );
          if (tempClosureId)
            await timed('Fechamento: remover', () =>
              closureService.deleteClosure(tempClosureId!)
            );
          if (tempPaymentMethodId !== null)
            await timed('Método de Pagamento: remover', () =>
              paymentMethodService.delete(tempPaymentMethodId!)
            );
          if (tempConvenioId !== null)
            await timed('Convênio: remover', () =>
              convenioService.delete(tempConvenioId!)
            );
          if (tempServiceId !== null)
            await timed('Serviço: remover', () =>
              serviceService.deleteService(tempServiceId!)
            );
          if (tempEmployeeId)
            await timed('Funcionário: remover', () =>
              employeeService.deleteEmployee(tempEmployeeId!)
            );
          if (tempPatientId)
            await timed('Paciente: remover', () =>
              patientService.deletePatient(tempPatientId!)
            );

          add('CRUD temporário concluído ✅');
        } catch (crudError) {
          console.error(crudError);
          add('Erro durante CRUD completo (alguns registros podem ter ficado)');
        }
      }

      add(`Testes concluídos ✅ em ${Date.now() - runStart}ms`);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      add(`Erro: ${msg}`);
    } finally {
      flushNetLogs('HTTP');
      disableNetMonitor();
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
          padding: 12,
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      >
        {log.map((l, i) => {
          const color = getLogColor(l);
          return (
            <div key={i} style={{ color }}>
              {l}
            </div>
          );
        })}
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
