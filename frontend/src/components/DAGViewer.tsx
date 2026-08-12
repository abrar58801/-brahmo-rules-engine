import React, { useState, useEffect } from 'react';
import { HierarchyLevel, Node } from '@/lib/types';

interface DAGViewerProps {
  hierarchy: HierarchyLevel[];
  nodes: Node[];
  reachableNodeIds: Set<string>;
  zone2NodeIds: Set<string>;
  entryPoint: string;
}

export const DAGViewer: React.FC<DAGViewerProps> = ({
  hierarchy,
  nodes,
  reachableNodeIds,
  zone2NodeIds,
  entryPoint,
}) => {
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Build tree structure
  const buildTree = () => {
    const levelMap = new Map<string, HierarchyLevel>();
    hierarchy.forEach(level => levelMap.set(level.id, level));

    const children = new Map<string, HierarchyLevel[]>();
    hierarchy.forEach(level => {
      if (level.parent_ids) {
        level.parent_ids.forEach(parentId => {
          if (!children.has(parentId)) {
            children.set(parentId, []);
          }
          children.get(parentId)!.push(level);
        });
      }
    });

    return { levelMap, children };
  };

  const { levelMap, children } = buildTree();

  const getLevelNodes = (levelId: string) => {
    return nodes.filter(n => n.hierarchy_level_id === levelId);
  };

  const toggleLevel = (levelId: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  const renderLevel = (levelId: string, depth: number = 0) => {
    const level = levelMap.get(levelId);
    if (!level) return null;

    const levelNodes = getLevelNodes(levelId);
    const isReachable = levelNodes.some(n => reachableNodeIds.has(n.id));
    const isZone2 = levelNodes.some(n => zone2NodeIds.has(n.id));
    const isEntry = levelId === entryPoint;
    const hasChildren = children.has(levelId);
    const isExpanded = expandedLevels.has(levelId);

    return (
      <div key={levelId} style={{ marginLeft: `${depth * 24}px` }} className="mb-2">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
            isEntry ? 'border-2 border-blue-500 bg-blue-50' :
            isReachable ? 'bg-green-50 hover:bg-green-100' :
            'bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => hasChildren && toggleLevel(levelId)}
        >
          {hasChildren && (
            <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
          )}
          <span className="text-sm font-medium">
            L{level.level_number}: {level.level_name}
          </span>
          {isEntry && (
            <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              Entry
            </span>
          )}
          {isReachable && !isEntry && (
            <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
              Reachable
            </span>
          )}
          {isZone2 && (
            <span className="px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full">
              Zone 2
            </span>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {levelNodes.length} nodes
          </span>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-1 border-l-2 border-gray-200 pl-4">
            {children.get(levelId)?.map(child => renderLevel(child.id, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find root levels (those with no parents)
  const roots = hierarchy.filter(level => !level.parent_ids || level.parent_ids.length === 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">DAG Hierarchy</h3>
      <div className="space-y-2">
        {roots.map(root => renderLevel(root.id))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-50 border border-green-300 rounded"></span>
          Reachable
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-purple-50 border border-purple-300 rounded"></span>
          Zone 2 (Global)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-50 border-2 border-blue-500 rounded"></span>
          Entry Point
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-50 border border-gray-300 rounded"></span>
          Not Reachable
        </span>
      </div>
    </div>
  );
};