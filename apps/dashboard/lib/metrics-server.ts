import { getAlerts } from '@/lib/supabase';
import {
  buildMetricsData,
  getMetricsStartDate,
  type MetricsData,
} from '@/lib/metrics';

export async function getMetricsData(): Promise<MetricsData> {
  const now = new Date();
  const startDate = getMetricsStartDate(now);
  const alerts = await getAlerts({ startDate, endDate: now });

  return buildMetricsData(alerts, now);
}
