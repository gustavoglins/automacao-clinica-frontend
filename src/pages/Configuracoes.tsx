import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useClinic } from '@/context/ClinicContext';
import { supabase } from '@/lib/supabaseClient';
import { webhookService, WebhookOperation } from '@/services/webhookService';
import { Clock, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClinicAddressSettings } from '@/components/configuracoes';

// Interface para os horários da clínica
interface ClinicHour {
  id?: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_open: boolean;
}

// Mapeamento dos dias da semana para o padrão do banco
const diasSemanaMap = {
  segunda: 'monday',
  terca: 'tuesday',
  quarta: 'wednesday',
  quinta: 'thursday',
  sexta: 'friday',
  sabado: 'saturday',
  domingo: 'sunday',
};

const Configuracoes = () => {
  const { clinicName, setClinicName } = useClinic();
  const [notificacoes, setNotificacoes] = useState(true);
  const [nomeClinica, setNomeClinica] = useState(clinicName);
  const [email, setEmail] = useState('');

  // Estados para funcionamento da clínica
  const [horarioFuncionamento, setHorarioFuncionamento] = useState({
    segunda: { ativo: true, inicio: '08:00', fim: '18:00' },
    terca: { ativo: true, inicio: '08:00', fim: '18:00' },
    quarta: { ativo: true, inicio: '08:00', fim: '18:00' },
    quinta: { ativo: true, inicio: '08:00', fim: '18:00' },
    sexta: { ativo: true, inicio: '08:00', fim: '18:00' },
    sabado: { ativo: true, inicio: '08:00', fim: '12:00' },
    domingo: { ativo: false, inicio: '08:00', fim: '18:00' },
  });

  const [configAgendamento, setConfigAgendamento] = useState({
    duracaoConsulta: '30',
    intervaloConsultas: '15',
    antecedenciaMinima: '1',
    antecedenciaMaxima: '90',
  });

  const [loading, setLoading] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(true);

  // Função para salvar horários no Supabase
  const saveClinicHours = async () => {
    try {
      setLoading(true);

      // Primeiro, busca os registros existentes
      const { data: existingData, error: fetchError } = await supabase
        .from('clinic_hours')
        .select('*');

      if (fetchError) {
        console.error('Erro ao buscar horários existentes:', fetchError);
        toast.error('Erro ao buscar horários existentes');
        return;
      }

      // Prepara os dados para upsert
      const horariosParaSalvar = Object.entries(horarioFuncionamento).map(
        ([diaLocal, config]) => {
          const diaDB = diasSemanaMap[diaLocal as keyof typeof diasSemanaMap];
          const existingRecord = existingData?.find(
            (record) => record.day_of_week === diaDB
          );

          return {
            id: existingRecord?.id,
            day_of_week: diaDB,
            open_time: config.inicio,
            close_time: config.fim,
            is_open: config.ativo,
          };
        }
      );

      // Faz upsert (insert ou update)
      const { error } = await supabase
        .from('clinic_hours')
        .upsert(horariosParaSalvar, {
          onConflict: 'day_of_week',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Erro ao salvar horários:', error);
        toast.error('Erro ao salvar horários de funcionamento');
      } else {
        toast.success('Horários de funcionamento salvos com sucesso!');

        // Enviar notificação de webhook
        try {
          await webhookService.notifyClinicHours(WebhookOperation.UPDATE);
          console.log('✅ [Webhook] Notificação enviada para clinic-hours');
        } catch (webhookError) {
          console.error(
            '❌ [Webhook] Erro ao enviar notificação:',
            webhookError
          );
        }
      }
    } catch (error) {
      console.error('Erro ao salvar horários:', error);
      toast.error('Erro ao salvar horários de funcionamento');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os horários quando o componente monta
  useEffect(() => {
    const loadClinicHours = async () => {
      try {
        setLoadingHorarios(true);
        const { data, error } = await supabase
          .from('clinic_hours')
          .select('*')
          .order('id');

        if (error) {
          console.error('Erro ao carregar horários:', error);
          return;
        }

        if (data && data.length > 0) {
          // Converte os dados do Supabase para o formato do estado local
          const horariosDB = {
            segunda: { ativo: true, inicio: '08:00', fim: '18:00' },
            terca: { ativo: true, inicio: '08:00', fim: '18:00' },
            quarta: { ativo: true, inicio: '08:00', fim: '18:00' },
            quinta: { ativo: true, inicio: '08:00', fim: '18:00' },
            sexta: { ativo: true, inicio: '08:00', fim: '18:00' },
            sabado: { ativo: true, inicio: '08:00', fim: '12:00' },
            domingo: { ativo: false, inicio: '08:00', fim: '18:00' },
          };

          Object.entries(diasSemanaMap).forEach(([diaLocal, diaDB]) => {
            const horarioDB = data.find((h) => h.day_of_week === diaDB);
            if (horarioDB) {
              horariosDB[diaLocal as keyof typeof horariosDB] = {
                ativo: horarioDB.is_open,
                inicio: horarioDB.open_time,
                fim: horarioDB.close_time,
              };
            }
          });

          setHorarioFuncionamento(horariosDB);
        }
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
      } finally {
        setLoadingHorarios(false);
      }
    };

    loadClinicHours();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClinicName(nomeClinica);
    toast.success('Informações da clínica salvas com sucesso!');
  };

  const handleHorarioChange = (
    dia: string,
    campo: string,
    valor: string | boolean
  ) => {
    setHorarioFuncionamento((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia as keyof typeof prev],
        [campo]: valor,
      },
    }));
  };

  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-left px-1">
          Configurações
        </h1>
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              Informações da Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
            <form onSubmit={handleSave} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="nomeClinica">Nome da clínica</Label>
                <Input
                  id="nomeClinica"
                  placeholder="Digite o nome da clínica"
                  value={nomeClinica}
                  onChange={(e) => setNomeClinica(e.target.value)}
                />
              </div>
              <Button variant="primary" className="w-full" type="submit">
                Salvar alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Seção de Endereços da Clínica */}
        <ClinicAddressSettings />

        {/* Seção de Funcionamento da Clínica */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Funcionamento da Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
            {/* Horários de Funcionamento */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold">
                Horários de Funcionamento
              </h3>
              {loadingHorarios ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-sm sm:text-base text-gray-500">
                    Carregando horários...
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {diasSemana.map((dia) => (
                    <div
                      key={dia.key}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={
                            horarioFuncionamento[
                              dia.key as keyof typeof horarioFuncionamento
                            ].ativo
                          }
                          onCheckedChange={(checked) =>
                            handleHorarioChange(dia.key, 'ativo', checked)
                          }
                        />
                        <Label className="font-medium text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">
                          {dia.label}
                        </Label>
                      </div>
                      {horarioFuncionamento[
                        dia.key as keyof typeof horarioFuncionamento
                      ].ativo && (
                        <div className="flex items-center gap-2 ml-8 sm:ml-0">
                          <Input
                            type="time"
                            value={
                              horarioFuncionamento[
                                dia.key as keyof typeof horarioFuncionamento
                              ].inicio
                            }
                            onChange={(e) =>
                              handleHorarioChange(
                                dia.key,
                                'inicio',
                                e.target.value
                              )
                            }
                            className="w-20 sm:w-24 text-sm"
                          />
                          <span className="text-gray-500 text-sm">às</span>
                          <Input
                            type="time"
                            value={
                              horarioFuncionamento[
                                dia.key as keyof typeof horarioFuncionamento
                              ].fim
                            }
                            onChange={(e) =>
                              handleHorarioChange(
                                dia.key,
                                'fim',
                                e.target.value
                              )
                            }
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* <Separator /> */}

            {/* TODO: */}
            {/* Configurações de Agendamento */}
            {/* <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Configurações de Agendamento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duracaoConsulta">Duração padrão da consulta (minutos)</Label>
                  <Select
                    value={configAgendamento.duracaoConsulta}
                    onValueChange={(value) => setConfigAgendamento(prev => ({ ...prev, duracaoConsulta: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="90">1h 30min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="intervaloConsultas">Intervalo entre consultas (minutos)</Label>
                  <Select
                    value={configAgendamento.intervaloConsultas}
                    onValueChange={(value) => setConfigAgendamento(prev => ({ ...prev, intervaloConsultas: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem intervalo</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="antecedenciaMinima">Antecedência mínima para agendamento (dias)</Label>
                  <Select
                    value={configAgendamento.antecedenciaMinima}
                    onValueChange={(value) => setConfigAgendamento(prev => ({ ...prev, antecedenciaMinima: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Mesmo dia</SelectItem>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="2">2 dias</SelectItem>
                      <SelectItem value="7">1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="antecedenciaMaxima">Antecedência máxima para agendamento (dias)</Label>
                  <Select
                    value={configAgendamento.antecedenciaMaxima}
                    onValueChange={(value) => setConfigAgendamento(prev => ({ ...prev, antecedenciaMaxima: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="180">6 meses</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div> */}

            {/* <Separator /> */}

            <Button
              variant="primary"
              className="w-full"
              onClick={saveClinicHours}
              disabled={loading}
            >
              {loading
                ? 'Salvando...'
                : 'Salvar Configurações de Funcionamento'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Configuracoes;
