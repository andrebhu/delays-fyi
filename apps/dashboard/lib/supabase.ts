import { createClient } from '@supabase/supabase-js'
import { Alert } from '@/types/alert'

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

export async function getTotalAlertsCount() {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total alerts count:', error);
    return 0;
  }

  return count || 0;
}

export async function getAlerts() {
  const today = new Date();
  const thirtyTwoDaysAgo = new Date();
  thirtyTwoDaysAgo.setDate(thirtyTwoDaysAgo.getDate() - 32);
  
  let allAlerts: Alert[] = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .gte('last_seen_time', thirtyTwoDaysAgo.toISOString())
      .lte('last_seen_time', today.toISOString())
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }

    if (!alerts || alerts.length === 0) {
      break;
    }

    allAlerts = [...allAlerts, ...alerts];
    from += pageSize;

    // If we got less than pageSize results, we've reached the end
    if (alerts.length < pageSize) {
      break;
    }
  }

  return allAlerts;
}