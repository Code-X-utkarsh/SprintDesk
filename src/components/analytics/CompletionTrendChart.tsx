import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { CompletionTrendItem } from '../../utils/analytics';

interface CompletionTrendChartProps {
  data: CompletionTrendItem[];
}

export const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No completed tasks recorded in trend timeline yet.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '0.75rem',
            }}
            formatter={(value: number, name: string) => [
              value,
              name === 'cumulative' ? 'Cumulative Completed' : 'Completed on Date',
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            name="cumulative"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#completionGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
