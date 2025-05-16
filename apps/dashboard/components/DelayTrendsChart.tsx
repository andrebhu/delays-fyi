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

interface DailyDelaysChartProps {
  data: {
    date: string;
    count: number;
  }[];
}

const chartConfig = {
  value: {
    label: 'Delays',
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
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600">Delays: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function DailyDelaysChart({ data }: DailyDelaysChartProps) {

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle>Recent Trends</CardTitle>
        <CardDescription>
          Subway delay counts over the last 30 days, aggregated by day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: '300px', width: '100%' }}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#CBCBCB" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              interval={1}
              axisLine={{ stroke: '#e5e7eb' }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              width={28}
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
