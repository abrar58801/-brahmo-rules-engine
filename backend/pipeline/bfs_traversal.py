import time
from typing import Set, Dict, List, Optional
from supabase import Client
from collections import deque

class BFSTraversal:
    """Performs BFS traversal upward through DAG"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.cache = {}  # Cache hierarchy relationships for performance
    
    def get_hierarchy_level(self, level_id: str) -> Optional[dict]:
        """Fetch hierarchy level with parent information"""
        if level_id in self.cache:
            return self.cache[level_id]
        
        result = self.supabase.table("hierarchy_levels")\
            .select("*")\
            .eq("id", level_id)\
            .execute()
        
        if result.data:
            self.cache[level_id] = result.data[0]
            return result.data[0]
        return None
    
    def get_nodes_at_level(self, level_id: str) -> List[str]:
        """Get all node IDs at a given hierarchy level"""
        result = self.supabase.table("knowledge_nodes")\
            .select("id")\
            .eq("hierarchy_level_id", level_id)\
            .execute()
        
        return [row["id"] for row in result.data]
    
    def traverse(self, entry_point: str) -> tuple[Set[str], Dict[str, int], float]:
        """
        Perform BFS traversal upward from entry point.
        Returns: (reachable_node_ids, distance_map, time_ms)
        """
        start_time = time.time()
        
        if not entry_point:
            return set(), {}, 0
        
        # Queue for BFS - stores (level_id, distance)
        queue = deque([(entry_point, 0)])
        visited_levels = set([entry_point])
        
        # Map node_id -> distance from entry point
        distance_map = {}
        
        # First, get nodes at entry point
        entry_nodes = self.get_nodes_at_level(entry_point)
        for node_id in entry_nodes:
            distance_map[node_id] = 0
        
        # BFS traversal
        while queue:
            current_level, distance = queue.popleft()
            
            # Get parent levels (walk UP the DAG)
            level_data = self.get_hierarchy_level(current_level)
            if not level_data:
                continue
            
            parent_ids = level_data.get("parent_ids", [])
            if not parent_ids:
                continue
            
            for parent_id in parent_ids:
                if parent_id not in visited_levels:
                    visited_levels.add(parent_id)
                    queue.append((parent_id, distance + 1))
                    
                    # Get all nodes at this parent level
                    parent_nodes = self.get_nodes_at_level(parent_id)
                    for node_id in parent_nodes:
                        if node_id not in distance_map:
                            distance_map[node_id] = distance + 1
        
        # Handle multi-parent nodes (visited set prevents duplicates)
        reachable_node_ids = set(distance_map.keys())
        
        bfs_time = (time.time() - start_time) * 1000
        return reachable_node_ids, distance_map, bfs_time