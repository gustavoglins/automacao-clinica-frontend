export interface Closure {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  type:
    | 'feriado'
    | 'férias'
    | 'recesso'
    | 'manutenção'
    | 'treinamento'
    | 'evento'
    | 'outro';
  is_recurring: boolean;
  created_at: string;
  updated_at?: string;
}
