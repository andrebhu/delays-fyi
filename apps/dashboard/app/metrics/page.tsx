import { supabase } from '../../lib/supabase';
import { Alert } from '../../types/alert';
import DelayBarChart from '../../components/DelayBarChart';
import DailyDelaysChart from '../../components/DailyDelaysChart';
import LineIndicator from '../../components/LineIndicator';

function categorizeCause(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('nypd')) return 'NYPD';
  if (lowerDesc.includes('ems')) return 'EMS';
  if (lowerDesc.includes('fdny')) return 'FDNY';
  if (lowerDesc.includes('brake')) return 'Brakes';
  if (lowerDesc.includes('door')) return 'Door';
  if (lowerDesc.includes('signal')) return 'Signal';
  if (lowerDesc.includes('track')) return 'Track';
  if (lowerDesc.includes('clean')) return 'Cleaning';
  if (lowerDesc.includes('switch')) return 'Switch';

  return 'Other';
}

async function getAlerts() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .gte('last_seen_time', oneWeekAgo.toISOString());

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  return alerts as Alert[];
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
  
  
  // Count occurrences of each cause
  const causeCounts = alerts.reduce((acc, alert) => {
    const cause = categorizeCause(alert.description);
    acc[cause] = (acc[cause] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to format needed for Recharts and sort by value in descending order
  const data = Object.entries(causeCounts)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);

  // Calculate daily delay counts and average duration
  const dailyData = alerts.reduce((acc, alert) => {
    const date = new Date(alert.last_seen_time + 'Z');
    const dateStr = date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
    
    if (!acc[dateStr]) {
      acc[dateStr] = {
        count: 0
      };
    }
    
    acc[dateStr].count += 1;
    
    return acc;
  }, {} as Record<string, { count: number }>);

  const chartData = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      count: data.count
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  const totalAlertsCount = await getTotalAlertsCount();
  // TODO: Hardcoded for now
  const mostCommonCause = "Brakes" 
  const mostDelayedTrain = "2"; 

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Alerts</h3>
                <p className="text-3xl font-bold text-blue-600">{totalAlertsCount}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Most Delayed Line</h3>
                <LineIndicator line={mostDelayedTrain} size="md" />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Most Common Cause</h3>
                <p className="text-3xl font-bold text-blue-600">{mostCommonCause}</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Daily Trends</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <DailyDelaysChart data={chartData} />
          </section>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Causes</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <DelayBarChart data={data} />
          </section>
        </div>
      </div>
    </main>
  );
}

export const revalidate = 900; // Revalidate every 15 minutes 