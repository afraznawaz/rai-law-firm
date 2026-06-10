// Supabase client using @supabase/supabase-js (pre-installed)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

// Hardcoded fallback so client always initialises correctly
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://utsywqriqdwongxqktpo.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_V9DWo3Dd2g3f_mCa-lPeRQ_BWM1Fkv7';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { supabase };
export default supabase;
