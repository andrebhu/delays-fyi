import { createClient } from '@supabase/supabase-js'
import { Alert } from '@/types/alert'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

type AlertQueryOptions = {
  startDate?: Date;
  endDate?: Date;
};

export async function getAlerts({ startDate, endDate = new Date() }: AlertQueryOptions = {}) {
  let allAlerts: Alert[] = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    let query = supabase
      .from('alerts')
      .select('alert_id, routes, start_time, last_seen_time, description, cause')
      .lte('last_seen_time', endDate.toISOString());

    if (startDate) {
      query = query.gte('last_seen_time', startDate.toISOString());
    }

    const { data: alerts, error } = await query
      .order('last_seen_time', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch alerts: ${error.message}`);
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
