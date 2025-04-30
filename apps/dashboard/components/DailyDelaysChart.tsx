'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DailyDelaysChartProps {
  data: Array<{
    date: string;
    count: number;
    avgDuration: number;
  }>;
}

export default function DailyDelaysChart({ data }: DailyDelaysChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end" 
            height={60}
            interval={0}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="count" name="Number of Delays" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="avgDuration" name="Avg Duration (min)" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 