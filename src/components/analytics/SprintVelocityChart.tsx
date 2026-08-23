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
import type { SprintVelocityItem } from '../../utils/analytics';

interface SprintVelocityChartProps {
  data: SprintVelocityItem[];
}

export const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No sprint velocity data available.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="name"
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
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number, name: string) => [
              value,
              name === 'completedTasks' ? 'Completed Tasks' : 'Total Tasks',
            ]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {value === 'completedTasks' ? 'Completed Tasks' : 'Total Tasks'}
              </span>
            )}
          />
          <Bar dataKey="completedTasks" name="completedTasks" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="totalTasks" name="totalTasks" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
