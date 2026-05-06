import DailyDelaysChart from '@/components/DelayTrendsChart';
import LineIndicator from '@/components/LineIndicator';
import RouteCountsChart from '@/components/RouteCountsChart';
import TimeOfDayChart from '@/components/TimeOfDayChart';
import type { MetricsData } from '@/lib/metrics';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type MetricsDashboardProps = {
  initialData: MetricsData;
};

export default function MetricsDashboard({ initialData }: MetricsDashboardProps) {
  const metrics = initialData;

  return (
    <>
      {!metrics.hasResults ? (
        <Card className="mb-12 gap-2">
          <CardHeader>
            <CardTitle>No matching alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No subway delay alerts are available for the current metrics window.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
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
                  <p className="text-3xl font-bold text-blue-600">
                    {metrics.totalAlerts.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Most Delayed Line</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.mostDelayedRoute ? (
                    <LineIndicator line={metrics.mostDelayedRoute} size="md" />
                  ) : (
                    <p className="text-sm text-gray-600">No data</p>
                  )}
                </CardContent>
              </Card>
              <Card className="gap-0">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Most Common Cause</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.mostCommonCause ? (
                    <p className="text-2xl font-bold leading-tight text-blue-600">
                      {metrics.mostCommonCause}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">Not enough data</p>
                  )}
                </CardContent>
              </Card>
            </div>
            <RouteCountsChart
              data={metrics.routeCounts}
              description={`Top routes in alerts for ${metrics.timeSummary}.`}
            />
          </section>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Trends</h2>
            </div>
            <div className="space-y-4">
              <DailyDelaysChart
                data={metrics.chartData}
                description={`Subway delay counts for ${metrics.timeSummary}.`}
              />
              <TimeOfDayChart
                data={metrics.timeOfDayChartData}
                description={`Average number of delays by hour for ${metrics.timeSummary}.`}
              />
            </div>
          </section>
        </>
      )}
    </>
  );
}
