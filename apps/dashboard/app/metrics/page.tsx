import { supabase, fetchRouteCounts } from '@/lib/supabase';
import { Alert } from '@/types/alert';
import DailyDelaysChart from '@/components/DelayTrendsChart';
import LineIndicator from '@/components/LineIndicator';
import RouteCountsChart from '@/components/RouteCountsChart';


async function getAlerts() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  let allAlerts: Alert[] = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .gte('last_seen_time', thirtyDaysAgo.toISOString())
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

  console.log(`Fetched ${allAlerts.length} total alerts`);
  return allAlerts;
}

async function getTotalAlertsCount() {
  const { count, error } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total alerts count:', error);
    return 0;
  }

  return count || 0;
}

export default async function MetricsPage() {
  const alerts = await getAlerts();

  // Calculate daily delay counts and average duration
  const dailyData = alerts.reduce((acc, alert) => {
    const date = new Date(alert.last_seen_time + 'Z');
    const dateStr = date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        count: 0,
        date: date // Store the actual date object for sorting
      };
    }
    
    acc[dateStr].count += 1;
    
    return acc;
  }, {} as Record<string, { count: number; date: Date }>);

  // Get the date range
  const dates = Object.values(dailyData).map(d => d.date);
  const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Fill in missing days with zero counts
  const allDates: { date: string; count: number }[] = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
    
    allDates.push({
      date: dateStr,
      count: dailyData[dateStr]?.count || 0
    });
  }

  console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());
  console.log('Total alerts:', alerts.length);
  console.log('Days with data:', Object.keys(dailyData).length);
  console.log('Days in range:', allDates.length);

  const chartData = allDates;

  const totalAlertsCount = await getTotalAlertsCount();
  const routeCounts = await fetchRouteCounts();

  const mostDelayedRoute = routeCounts[0].route;
  
  // TODO: Hardcoded for now
  const mostCommonCause = "Brakes" 

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Alerts</h3>
                <p className="text-3xl font-bold text-blue-600">{totalAlertsCount}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Most Delayed Line</h3>
                <LineIndicator line={mostDelayedRoute} size="md" />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Most Common Cause</h3>
                <p className="text-3xl font-bold text-blue-600">{mostCommonCause}</p>
              </div>
            </div>
            <RouteCountsChart data={routeCounts} />
          </section>

          {/* <section className="mb-12">
            <RouteCountsChart data={routeCounts} />
          </section> */}

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Trends</h2>
            </div>
            <DailyDelaysChart data={chartData} />
          </section>
        </div>
      </div>
    </main>
  );
}

export const revalidate = 900; // Revalidate every 15 minutes 