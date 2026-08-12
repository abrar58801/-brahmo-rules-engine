import React from 'react';
import { CandidateSet } from '@/lib/types';

interface ComparisonViewProps {
  results: CandidateSet[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ results }) => {
  if (results.length < 2) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Run pipeline for at least 2 users to compare
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">User Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="font-semibold text-gray-800">{result.user_name}</div>
            <div className="text-sm text-gray-500">
              {result.role}, Level {result.ceiling_level}
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Point:</span>
                <span className="font-mono text-xs">{result.entry_point}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reachable:</span>
                <span>{result.funnel.after_bfs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">After Zone 2:</span>
                <span>{result.funnel.after_zone2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Final Set:</span>
                <span className="font-bold text-blue-600">{result.funnel.after_check5}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-mono text-xs">{result.pipeline_timing.total_ms.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};