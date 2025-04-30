'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeOfDayChartProps {
  data: Array<{
    hour: string;
    count: number;
  }>;
}

export default function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="hour" 
            label={{ value: 'Hour of Day', position: 'bottom' }}
          />
          <YAxis label={{ value: 'Number of Alerts', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 