import { fetchRouteCounts, getTotalAlertsCount, getAlerts } from '@/lib/supabase';
import DailyDelaysChart from '@/components/DelayTrendsChart';
import LineIndicator from '@/components/LineIndicator';
import RouteCountsChart from '@/components/RouteCountsChart';
import TimeOfDayChart from '@/components/TimeOfDayChart';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function MetricsPage() {
  const alerts = await getAlerts();

  // Calculate daily delay counts
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

  // Calculate time of day distribution
  const timeOfDayData = alerts.reduce((acc, alert) => {
    const date = new Date(alert.start_time + 'Z');
    const hour = date.getUTCHours();
    
    if (!acc[hour]) {
      acc[hour] = {
        count: 0,
        days: new Set()
      };
    }
    
    // Add the date to the set of days for this hour
    const dateKey = date.toISOString().split('T')[0];
    acc[hour].days.add(dateKey);
    acc[hour].count += 1;
    
    return acc;
  }, {} as Record<number, { count: number; days: Set<string> }>);

  // Convert to array and calculate averages
  const timeOfDayChartData = Object.entries(timeOfDayData)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      count: data.count / data.days.size // Average per day
    }))
    .sort((a, b) => a.hour - b.hour);

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

  // Take only the last 30 days of data
  const chartData = allDates.slice(-31);

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
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{totalAlertsCount}</p>
                </CardContent>
              </Card>
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Most Delayed Line</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineIndicator line={mostDelayedRoute} size="md" />
                </CardContent>
              </Card>
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Most Common Cause</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{mostCommonCause}</p>
                </CardContent>
              </Card>
            </div>
            <RouteCountsChart data={routeCounts} />
          </section>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Trends</h2>
            </div>
            <div className="space-y-4">
              <DailyDelaysChart data={chartData} />
              <TimeOfDayChart data={timeOfDayChartData} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export const revalidate = 900; // Revalidate every 15 minutes 