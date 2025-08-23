import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUP_DEV_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUP_DEV_API_KEY as
  | string
  | undefined;

// Flag indicando se podemos realmente inicializar
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Instância lazy – só cria quando for realmente usada
let _supabase: SupabaseClient | null = null;

function _create() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase não configurado (defina VITE_SUP_DEV_URL e VITE_SUP_DEV_API_KEY ou remova o fallback).'
    );
  }
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = _create();
  }
  return _supabase;
}

// Export antigo para compatibilidade – pode ser null se não configurado
// (Evitar usar diretamente; prefira getSupabase())
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? getSupabase()
  : null;

export async function testConnection(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const client = getSupabase();
    const { error } = await client
      .from('patients')
      .select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
// (export único de testConnection acima)
