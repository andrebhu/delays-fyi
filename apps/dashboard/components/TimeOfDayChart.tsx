'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
    avgWeekday: number;
    avgWeekend: number;
  }[];
}

const chartConfig = {
  value: {
    label: 'Average Delays',
    color: 'oklch(62.3% 0.214 259.815)', // Blue-500 for weekday
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
  payload?: Array<{ value: number; name: string; dataKey: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    const hour = label as number;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const timeLabel = `${displayHour} ${period}`;

    const weekdayPoint = payload.find(p => p.dataKey === 'avgWeekday');
    const weekendPoint = payload.find(p => p.dataKey === 'avgWeekend');

    return (
      <div className="bg-white p-4 border rounded-lg shadow-sm space-y-1">
        <p className="font-medium">{timeLabel}</p>
        {weekdayPoint && (
          <p className="text-blue-600">
            Weekday: {weekdayPoint.value.toFixed(1)}
          </p>
        )}
        {weekendPoint && (
          <p className="text-green-600">
            Weekend: {weekendPoint.value.toFixed(1)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle>Hourly Averages</CardTitle>
        <CardDescription>
          Average number of delays by hour of day over the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: '300px', width: '100%' }}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
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
              interval={1}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={28}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={30} />
            <Line
              type="monotone"
              dataKey="avgWeekday"
              name="Weekday"
              stroke={chartConfig.value.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="avgWeekend"
              name="Weekend"
              stroke="oklch(80% 0.1 130)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
