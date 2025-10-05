import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://znpezmhbxqpxzpplhgke.supabase.co";
const supabaseAnonKey = "sb_publishable_NGEp2ivHlSZgylCuDK0K0Q_iWGcTlhQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
