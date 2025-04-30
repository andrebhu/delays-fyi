import { supabase } from '../../lib/supabase';
import { Alert } from '@/types/alert';
import DelayBarChart from '@/components/DelayBarChart';
import DailyDelaysChart from '@/components/DailyDelaysChart';
import IncidentsList from '@/components/IncidentsList';

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

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Delay Overview</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">Total Delays</h3>
                <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-700">Average Duration</h3>
                <p className="text-3xl font-bold text-gray-900">{averageDurationMinutes} min</p>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Delays by Day</h3>
            <DailyDelaysChart data={chartData} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Causes</h2>
              <span className="text-sm text-gray-500">Past 7 days</span>
            </div>
            <DelayBarChart data={data} />
          </div>
          <IncidentsList alerts={alerts} categories={CATEGORIES} />
        </div>
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 900; // Revalidate every 15 minutes 