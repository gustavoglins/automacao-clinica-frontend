import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUP_DEV_URL;
const supabaseKey = import.meta.env.VITE_SUP_DEV_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
