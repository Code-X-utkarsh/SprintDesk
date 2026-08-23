import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { PriorityBreakdownItem } from '../../utils/analytics';

interface PriorityBreakdownChartProps {
  data: PriorityBreakdownItem[];
}

export const PriorityBreakdownChart: React.FC<PriorityBreakdownChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No priority breakdown data available.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="statusLabel"
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
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {value} Priority
              </span>
            )}
          />
          <Bar dataKey="High" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} maxBarSize={45} />
          <Bar dataKey="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={45} />
          <Bar dataKey="Low" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
