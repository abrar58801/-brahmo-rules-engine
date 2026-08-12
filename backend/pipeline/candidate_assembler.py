import time
from typing import Set, Dict, List, Optional
from supabase import Client
from models.candidate_set import CandidateNode

class CandidateAssembler:
    """Assembles final candidate set with annotations"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.node_cache = {}
        self.level_cache = {}
    
    def get_node_details(self, node_id: str) -> Optional[dict]:
        if node_id in self.node_cache:
            return self.node_cache[node_id]
        
        result = self.supabase.table("knowledge_nodes")\
            .select("*")\
            .eq("id", node_id)\
            .execute()
        
        if result.data:
            self.node_cache[node_id] = result.data[0]
            return result.data[0]
        return None
    
    def get_hierarchy_level(self, level_id: str) -> Optional[dict]:
        if level_id in self.level_cache:
            return self.level_cache[level_id]
        
        result = self.supabase.table("hierarchy_levels")\
            .select("*")\
            .eq("id", level_id)\
            .execute()
        
        if result.data:
            self.level_cache[level_id] = result.data[0]
            return result.data[0]
        return None
    
    def get_compression_hint(self, distance: int) -> str:
        """Determine compression hint based on distance from entry"""
        if distance <= 1:
            return "FULL"
        elif distance == 2:
            return "COMPRESSED"
        else:
            return "CONSTRAINT_ONLY"
    
    def assemble(
        self,
        node_ids: Set[str],
        distance_map: Dict[str, int],
        user_id: str,
        user_name: str,
        role: str,
        ceiling_level: int,
        entry_point: str
    ) -> tuple[List[CandidateNode], float]:
        """Assemble final candidate set with annotations"""
        start_time = time.time()
        
        candidate_nodes = []
        
        for node_id in node_ids:
            node = self.get_node_details(node_id)
            if not node:
                continue
            
            # Get hierarchy level info
            hierarchy = self.get_hierarchy_level(node.get("hierarchy_level_id"))
            level_number = hierarchy.get("level_number") if hierarchy else None
            
            distance = distance_map.get(node_id, 999)  # Default to far if not in map
            
            candidate = CandidateNode(
                id=node_id,
                type=node.get("type", "FACT"),
                title=node.get("title", ""),
                content=node.get("content", ""),
                importance=node.get("importance", 0.5),
                zone=node.get("zone", 1),
                hierarchy_level=level_number,
                department=node.get("department"),
                distance_from_entry=distance,
                compression_hint=self.get_compression_hint(distance)
            )
            candidate_nodes.append(candidate)
        
        # Sort by importance descending, then by distance
        candidate_nodes.sort(key=lambda x: (-x.importance, x.distance_from_entry))
        
        assemble_time = (time.time() - start_time) * 1000
        return candidate_nodes, assemble_time