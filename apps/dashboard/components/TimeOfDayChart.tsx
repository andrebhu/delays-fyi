'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
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

interface TimeOfDayChartProps {
  data: {
    hour: number;
    count: number;
  }[];
}

const chartConfig = {
  value: {
    label: 'Average Delays',
    color: 'oklch(62.3% 0.214 259.815)', // Blue-500
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
  payload?: Array<{ value: number; name: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    const hour = label as number;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const timeLabel = `${displayHour} ${period}`;
    
    return (
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <p className="font-medium">{timeLabel}</p>
        <p className="text-blue-600">Average Delays: {payload[0].value.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};

export default function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle>Time of Day Distribution</CardTitle>
        <CardDescription>
          Average number of delays by hour of day over the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: '300px', width: '100%' }}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#CBCBCB" />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(hour) => {
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour} ${period}`;
              }}
              angle={-45}
              textAnchor="end"
              interval={0} // Show all ticks
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={28}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={chartConfig.value.color}
              fill="hsl(221.2 83.2% 53.3% / 0.2)" // translucent fill
              strokeWidth={2}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 