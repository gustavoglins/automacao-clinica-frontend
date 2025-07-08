import { createClient } from '@supabase/supabase-js';

const apiUrl = import.meta.env.VITE_SUP_DEV_URL;
const apiKey = import.meta.env.VITE_SUP_DEV_API_KEY;

export const supabase = createClient(
  apiUrl,
  apiKey
);
