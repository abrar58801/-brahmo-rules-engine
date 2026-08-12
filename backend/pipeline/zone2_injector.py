import time
from typing import Set
from supabase import Client

class Zone2Injector:
    """Injects Zone 2 (Global) nodes into the candidate set"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.cache = None
    
    def get_zone2_nodes(self) -> Set[str]:
        """Fetch all Zone 2 node IDs (cached)"""
        if self.cache is not None:
            return self.cache
        
        result = self.supabase.table("knowledge_nodes")\
            .select("id")\
            .eq("zone", 2)\
            .eq("status", "ACTIVE")\
            .execute()
        
        self.cache = set([row["id"] for row in result.data])
        return self.cache
    
    def inject(self, node_ids: Set[str]) -> tuple[Set[str], float]:
        """Inject Zone 2 nodes into the set"""
        start_time = time.time()
        
        zone2_nodes = self.get_zone2_nodes()
        combined = node_ids | zone2_nodes
        
        inject_time = (time.time() - start_time) * 1000
        return combined, inject_time