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

  // Delay Trends Chart calculations

  type DailyCauseCounts = {
    date: Date;
    dateLabel: string;
    total: number;
    causes: Record<string, number>;
  };

  const dailyMap = alerts.reduce(
    (acc, alert) => {
      // parse and format the day in America/New_York
      const date = new Date(alert.last_seen_time + 'Z');
      const dateLabel = date.toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      });
  
      // first time we see this day? initialize
      if (!acc[dateLabel]) {
        acc[dateLabel] = {
          date,
          dateLabel,
          total: 0,
          causes: {} as Record<string, number>,
        };
      }
  
      const entry = acc[dateLabel];
  
      // increment the specific cause
      const cause = alert.cause ?? 'unknown';
      entry.causes[cause] = (entry.causes[cause] || 0) + 1;
  
      // keep the grand total in sync
      entry.total += 1;
  
      return acc;
    },
    {} as Record<string, DailyCauseCounts>
  );

  const dailyData: DailyCauseCounts[] = Object.values(dailyMap).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // const dailyData = alerts.reduce((acc, alert) => {
  //   const date = new Date(alert.last_seen_time + 'Z');
  //   const dateStr = date.toLocaleDateString('en-US', {
  //     timeZone: 'America/New_York',
  //     month: 'numeric',
  //     day: 'numeric',
  //     weekday: 'short'
  //   });
    
  //   if (!acc[dateStr]) {
  //     acc[dateStr] = {
  //       count: 0,
  //       date: date // Store the actual date object for sorting
  //     };
  //   }
    
  //   acc[dateStr].count += 1;
    
  //   return acc;
  // }, {} as Record<string, { count: number; date: Date }>);






  // Time of Day Chart calculations
  type HourBucket = {
    weekday: { count: number; days: Set<string> };
    weekend: { count: number; days: Set<string> };
  };
  const timeOfDayData = alerts.reduce((acc, alert) => {
    const date = new Date(alert.start_time + 'Z');
    const hour = date.getUTCHours();
    const dateKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const isWeekend = [0, 6].includes(date.getUTCDay());
  
    if (!acc[hour]) {
      acc[hour] = {
        weekday: { count: 0, days: new Set<string>() },
        weekend: { count: 0, days: new Set<string>() },
      };
    }
  
    const bucket = isWeekend ? acc[hour].weekend : acc[hour].weekday;
    bucket.count += 1;
    bucket.days.add(dateKey);
  
    return acc;
  }, {} as Record<number, HourBucket>);
  
  // 2) Convert to sorted array, computing avg per day for each
  const timeOfDayChartData = Object.entries(timeOfDayData)
    .map(([hourStr, { weekday, weekend }]) => {
      const hour = parseInt(hourStr, 10);
      const avgWeekday =
        weekday.days.size > 0 ? weekday.count / weekday.days.size : 0;
      const avgWeekend =
        weekend.days.size > 0 ? weekend.count / weekend.days.size : 0;
      return { hour, avgWeekday, avgWeekend };
    })
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
      count: dailyData.find(d => d.dateLabel === dateStr)?.total || 0
    });
  }

  // Take only the last 30 days of data
  const chartData = allDates.slice(-31);

  const totalAlertsCount = await getTotalAlertsCount();
  const routeCounts = await fetchRouteCounts();

  const mostDelayedRoute = routeCounts[0].route;
  
  // TODO: Hardcoded for now
  const mostCommonCause = "Subway Cars"

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