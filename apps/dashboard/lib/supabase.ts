import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Query functions

export async function fetchRouteCounts() {
  const { data, error } = await supabase
    .from('route_counts')
    .select('route, count')
    .order('count', { ascending: false });

  if (error) throw new Error(`Failed to fetch route counts: ${error.message}`);
  return data || [];
}