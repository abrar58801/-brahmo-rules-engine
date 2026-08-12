import React from 'react';
import { FunnelStats } from '@/lib/types';

interface FilterFunnelProps {
  stats: FunnelStats;
}

export const FilterFunnel: React.FC<FilterFunnelProps> = ({ stats }) => {
  const stages = [
    { label: 'Total', value: stats.total_nodes, color: 'bg-gray-200' },
    { label: 'After BFS', value: stats.after_bfs, color: 'bg-blue-400' },
    { label: 'After Zone 2', value: stats.after_zone2, color: 'bg-blue-500' },
    { label: 'Check 1: Isolation', value: stats.after_check1, color: 'bg-green-400' },
    { label: 'Check 2: Compliance', value: stats.after_check2, color: 'bg-green-500' },
    { label: 'Check 3: Permission', value: stats.after_check3, color: 'bg-yellow-400' },
    { label: 'Check 4: Temporal', value: stats.after_check4, color: 'bg-orange-400' },
    { label: 'Check 5: Derivability', value: stats.after_check5, color: 'bg-red-500' },
  ];

  const maxValue = Math.max(...stages.map(s => s.value), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Funnel</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 w-40 text-right">
              {stage.label}
            </span>
            <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${stage.color} transition-all duration-500 ease-in-out`}
                style={{ width: `${(stage.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700 w-16">
              {stage.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};