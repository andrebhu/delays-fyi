'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, LabelList } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

interface DelayBarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const chartConfig = {
  value: {
    label: "Delays",
    color: "hsl(221.2 83.2% 53.3%)", // Blue-600
  },
  label: {
    color: "hsl(0 0% 100%)", // White
  },
} satisfies ChartConfig;

export default function DelayBarChart({ data }: DelayBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Causes of Delays</CardTitle>
        <CardDescription>This chart shows the most frequent causes for delays.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: 'hsl(var(--foreground))' }}
              tickFormatter={(value: string) => value}
            />
            <XAxis
              dataKey="value"
              type="number"
              hide
            />
            <Bar
              dataKey="value"
              fill="hsl(221.2 83.2% 53.3%)"
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