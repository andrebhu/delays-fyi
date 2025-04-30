import { supabase } from '../../lib/supabase';
import { Alert } from '@/types/alert';
import DelayBarChart from '@/components/DelayBarChart';
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

export default async function CausesPage() {
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

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-6">Distribution of Delay Causes</h2>
            <DelayBarChart data={data} />
          </div>
          <IncidentsList alerts={alerts} categories={CATEGORIES} />
        </div>
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidate every 10 minutes 