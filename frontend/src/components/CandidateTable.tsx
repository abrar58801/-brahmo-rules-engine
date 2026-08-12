import React from 'react';
import { CandidateNode } from '@/lib/types';

interface CandidateTableProps {
  nodes: CandidateNode[];
}

const typeColors = {
  CONSTRAINT: 'bg-red-100 text-red-800',
  DECISION: 'bg-blue-100 text-blue-800',
  ANTI_PATTERN: 'bg-orange-100 text-orange-800',
  FACT: 'bg-green-100 text-green-800',
};

const zoneLabels = {
  1: 'Addressed',
  2: 'Global',
  3: 'Floating',
};

const compressionColors = {
  FULL: 'bg-green-100 text-green-800',
  COMPRESSED: 'bg-yellow-100 text-yellow-800',
  CONSTRAINT_ONLY: 'bg-gray-100 text-gray-800',
};

export const CandidateTable: React.FC<CandidateTableProps> = ({ nodes }) => {
  if (nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No candidate nodes found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Importance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Zone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compression
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {nodes.map((node) => (
              <tr key={node.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${typeColors[node.type as keyof typeof typeColors] || 'bg-gray-100'}`}>
                    {node.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{node.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{node.content}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {(node.importance * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {zoneLabels[node.zone as keyof typeof zoneLabels] || node.zone}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {node.distance_from_entry}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${compressionColors[node.compression_hint as keyof typeof compressionColors]}`}>
                    {node.compression_hint}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        Total: {nodes.length} nodes
      </div>
    </div>
  );
};