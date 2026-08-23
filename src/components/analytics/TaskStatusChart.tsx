import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { TaskStatusItem } from '../../utils/analytics';

interface TaskStatusChartProps {
  data: TaskStatusItem[];
}

export const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No task status distribution data available.
      </div>
    );
  }

  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '0.5rem',
              color: '#f8fafc',
              fontSize: '0.75rem',
            }}
            formatter={(value: number, name: string) => [
              `${value} tasks (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
