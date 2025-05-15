'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
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

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload?.length) {
    const item = payload[0];
    return (
      <div className="rounded-md border bg-white p-2 shadow-sm text-sm">
        <div className="font-semibold">Line {item.payload.name}</div>
        <div>{item.value.toLocaleString()} delays</div>
      </div>
    );
  }
  return null;
};

export default function RouteCountsChart({ data }: RouteCountsChartProps) {
  // Only show the top 10 most delayed lines
  const topData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(({ route, count }) => ({
      name: route,
      value: count,
    }));

  const rowHeight = 30; // px per bar
  const chartHeight = rowHeight * topData.length;
  const maxHeight = 500; // Max scroll height

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle>Most Delayed</CardTitle>
        <CardDescription>
          Top 10 most delayed subway lines based on historical alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden" style={{ maxHeight }}>
        <ChartContainer config={chartConfig} style={{ height: chartHeight, width: '100%' }}>
          <BarChart
            data={topData}
            layout="vertical"
            barSize={25}
          >
            <YAxis
              dataKey="name"
              width={28}
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
            <Tooltip content={<CustomTooltip />} />
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


