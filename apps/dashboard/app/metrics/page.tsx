import MetricsDashboard from '@/components/MetricsDashboard';
import { getMetricsData } from '@/lib/metrics-server';

export default async function MetricsPage() {
  const metrics = await getMetricsData();

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <MetricsDashboard initialData={metrics} />
        </div>
      </div>
    </main>
  );
}

export const revalidate = 900; // Revalidate every 15 minutes
