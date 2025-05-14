'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartConfig,
} from '@/components/ui/chart';
import LineIndicator from './LineIndicator';

interface RouteCountsChartProps {
  data: Array<{
    route: string;
    count: number;
  }>;
}

const chartConfig = {
  value: {
    label: 'Delays',
    color: 'hsl(221.2 83.2% 53.3%)', // Blue-600
  },
  label: {
    color: 'hsl(0 0% 100%)', // White
  },
} satisfies ChartConfig;

export default function RouteCountsChart({ data }: RouteCountsChartProps) {
  // Only show the top 10 most delayed lines
  const topData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ route, count }) => ({
      name: route,
      value: count,
    }));

  const rowHeight = 28; // px per bar
  const chartHeight = rowHeight * topData.length;
  const maxHeight = 500; // Max scroll height

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Delay Counts</CardTitle>
        <CardDescription>
          Top 10 most frequently delayed subway lines based on historical alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto" style={{ maxHeight }}>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={topData}
            layout="vertical"
            width={600}
            height={chartHeight}
            margin={{ left: 0 }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={25}
              axisLine={false}
              interval={0} // Forces all ticks to show
              tick={({ x, y, payload }) => (
                <foreignObject x={x} y={y - rowHeight / 2} width={50} height={rowHeight} style={{ overflow: 'visible' }}>
                  <div style={{ display: 'flex', alignItems: 'center', height: `${rowHeight}px` }}>
                    <LineIndicator line={payload.value} size="sm" />
                  </div>
                </foreignObject>
              )}
            />
            <XAxis type="number" hide />
            <Bar
              dataKey="value"
              fill={chartConfig.value.color}
              radius={4}
              minPointSize={5}
            >
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => value.toLocaleString()}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}


