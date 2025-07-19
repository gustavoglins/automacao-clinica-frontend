import { createClient } from '@supabase/supabase-js';

const apiUrl = import.meta.env.VITE_SUP_DEV_URL;
const apiKey = import.meta.env.VITE_SUP_DEV_API_KEY;

// Verificar se as variáveis de ambiente estão configuradas
if (!apiUrl || !apiKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.error('VITE_SUP_DEV_URL:', apiUrl ? '✅ Configurado' : '❌ Não configurado');
  console.error('VITE_SUP_DEV_API_KEY:', apiKey ? '✅ Configurado' : '❌ Não configurado');
  console.error('Crie um arquivo .env na raiz do projeto com:');
  console.error('VITE_SUP_DEV_URL=sua_url_do_supabase');
  console.error('VITE_SUP_DEV_API_KEY=sua_chave_do_supabase');
}

export const supabase = createClient(
  apiUrl || '',
  apiKey || ''
);

// Teste de conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('patients').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return false;
    }
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
};
