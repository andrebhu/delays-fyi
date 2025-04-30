import { supabase } from '../../lib/supabase';
import { Alert } from '../../types/alert';
import DelayBarChart from '../../components/DelayBarChart';
import DailyDelaysChart from '../../components/DailyDelaysChart';
import TimeOfDayChart from '../../components/TimeOfDayChart';
import IncidentsList from '../../components/IncidentsList';

const CATEGORIES = ['NYPD', 'EMS', 'FDNY', 'Brakes', 'Door', 'Signal', 'Track', 'Cleaning', 'Switch', 'Disruptive', 'Mechanical', 'Other'];

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
  if (lowerDesc.includes('disruptive')) return 'Disruptive';
  if (lowerDesc.includes('mechanical')) return 'Mechanical';
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
        count: 0,
        totalDuration: 0
      };
    }
    
    const start = new Date(alert.start_time + 'Z');
    const end = new Date(alert.last_seen_time + 'Z');
    const duration = end.getTime() - start.getTime();
    
    acc[dateStr].count += 1;
    acc[dateStr].totalDuration += duration;
    
    return acc;
  }, {} as Record<string, { count: number; totalDuration: number }>);

  const chartData = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      count: data.count,
      avgDuration: Number((data.totalDuration / (data.count * 60000)).toFixed(1))
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate overall average duration
  const totalDuration = alerts.reduce((sum, alert) => {
    const start = new Date(alert.start_time + 'Z');
    const end = new Date(alert.last_seen_time + 'Z');
    return sum + (end.getTime() - start.getTime());
  }, 0);
  
  const averageDurationMinutes = Number((totalDuration / (alerts.length * 60000)).toFixed(1));

  // Calculate time of day distribution (averaged over 7 days)
  const timeOfDayData = Array.from({ length: 24 }, (_, hour) => {
    const hourStr = hour.toString().padStart(2, '0') + ':00';
    const count = alerts.filter(alert => {
      const startTime = new Date(alert.start_time + 'Z');
      return startTime.getUTCHours() === hour;
    }).length;
    // Average the count over 7 days
    return { hour: hourStr, count: Number((count / 7).toFixed(2)) };
  });

  const mostCommonCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Overview</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Delays</h3>
                <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Average Duration</h3>
                <p className="text-3xl font-bold text-blue-600">{Number(averageDurationMinutes.toFixed(1))} min</p>
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
              <h2 className="text-2xl font-semibold">Time of Day</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <TimeOfDayChart data={timeOfDayData} />
          </section>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Causes</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <DelayBarChart data={data} />
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">All Incidents</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <div className="bg-white rounded-lg shadow">
              <IncidentsList alerts={alerts} categories={CATEGORIES} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 900; // Revalidate every 15 minutes 