import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Save, RotateCcw } from 'lucide-react';
import { clinicHoursService } from '@/services/clinicHoursService';
import { ClinicHours, DAYS_OF_WEEK } from '@/types/clinicHours';
import { toast } from 'sonner';

export const ClinicHoursSettings: React.FC = () => {
  const [clinicHours, setClinicHours] = useState<ClinicHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadClinicHours();
  }, []);

  const loadClinicHours = async () => {
    setIsLoading(true);
    try {
      const hours = await clinicHoursService.getAllClinicHours();
      setClinicHours(hours);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      toast.error('Erro ao carregar horários de funcionamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHours = async () => {
    console.log('🔔 [DEBUG] Botão "Salvar" clicado - Iniciando salvamento...');

    setIsSaving(true);
    try {
      // Usar a nova função que salva em lote e envia apenas um webhook
      const hoursArray = clinicHours.map((hours) => ({
        dayOfWeek: hours.dayOfWeek,
        openTime: hours.openTime,
        closeTime: hours.closeTime,
        isOpen: hours.isOpen,
      }));

      console.log('🔔 [DEBUG] Dados dos horários:', hoursArray);
      console.log(
        '🔔 [DEBUG] Chamando clinicHoursService.saveMultipleClinicHours...'
      );

      await clinicHoursService.saveMultipleClinicHours(hoursArray);

      console.log(
        '✅ [DEBUG] clinicHoursService.saveMultipleClinicHours finalizado'
      );
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao salvar horários:', error);
      toast.error('Erro ao salvar horários de funcionamento');
    } finally {
      setIsSaving(false);
      console.log('🔔 [DEBUG] Finalizando handleSaveHours');
    }
  };

  const handleResetToDefault = () => {
    const defaultHours: ClinicHours[] = [
      {
        id: 1,
        dayOfWeek: 'monday',
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: true,
      },
      {
        id: 2,
        dayOfWeek: 'tuesday',
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: true,
      },
      {
        id: 3,
        dayOfWeek: 'wednesday',
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: true,
      },
      {
        id: 4,
        dayOfWeek: 'thursday',
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: true,
      },
      {
        id: 5,
        dayOfWeek: 'friday',
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: true,
      },
      {
        id: 6,
        dayOfWeek: 'saturday',
        openTime: '08:00',
        closeTime: '12:00',
        isOpen: true,
      },
      {
        id: 7,
        dayOfWeek: 'sunday',
        openTime: null,
        closeTime: null,
        isOpen: false,
      },
    ];
    setClinicHours(defaultHours);
  };

  const updateDayHours = (
    dayOfWeek: string,
    field: keyof ClinicHours,
    value: string | boolean | null
  ) => {
    setClinicHours((prev) =>
      prev.map((hours) =>
        hours.dayOfWeek === dayOfWeek ? { ...hours, [field]: value } : hours
      )
    );
  };

  const ensureAllDaysPresent = React.useCallback(() => {
    const missingDays = Object.keys(DAYS_OF_WEEK).filter(
      (day) => !clinicHours.find((h) => h.dayOfWeek === day)
    );

    if (missingDays.length > 0) {
      const newHours = missingDays.map((day, index) => ({
        id: Date.now() + index,
        dayOfWeek: day,
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: day !== 'sunday',
      }));
      setClinicHours((prev) => [...prev, ...newHours]);
    }
  }, [clinicHours]);

  useEffect(() => {
    if (clinicHours.length > 0) {
      ensureAllDaysPresent();
    }
  }, [clinicHours.length, ensureAllDaysPresent]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Carregando horários...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Horários de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {Object.entries(DAYS_OF_WEEK).map(([key, displayName]) => {
            const dayHours = clinicHours.find((h) => h.dayOfWeek === key) || {
              id: 0,
              dayOfWeek: key,
              openTime: '08:00',
              closeTime: '18:00',
              isOpen: key !== 'domingo',
            };

            return (
              <div
                key={key}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-[150px]">
                  <Switch
                    checked={dayHours.isOpen}
                    onCheckedChange={(checked) =>
                      updateDayHours(key, 'isOpen', checked)
                    }
                  />
                  <Label className="font-medium">{displayName}</Label>
                </div>

                {dayHours.isOpen && (
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Abertura:</Label>
                      <Input
                        type="time"
                        value={dayHours.openTime || '08:00'}
                        onChange={(e) =>
                          updateDayHours(key, 'openTime', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Fechamento:</Label>
                      <Input
                        type="time"
                        value={dayHours.closeTime || '18:00'}
                        onChange={(e) =>
                          updateDayHours(key, 'closeTime', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  </div>
                )}

                {!dayHours.isOpen && (
                  <div className="flex-1 text-sm text-muted-foreground">
                    Fechado
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Padrão
          </Button>

          <Button
            onClick={handleSaveHours}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
