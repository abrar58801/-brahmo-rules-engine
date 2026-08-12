import time
from typing import Set, List, Dict, Optional
from supabase import Client
from datetime import datetime

class FiveCheckFilter:
    """Sequential 5-check filter pipeline"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.node_cache = {}  # Cache node details for performance
    
    def get_node_details(self, node_id: str) -> Optional[dict]:
        """Fetch node details with caching"""
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
    
    def check1_isolation(self, node_ids: Set[str], org_id: str) -> tuple[Set[str], float]:
        """Check 1: Organization isolation"""
        start_time = time.time()
        
        # In SQL: WHERE org_id = user.org_id
        # We assume all nodes are in the same org for this demo
        # In production, fetch only nodes with matching org_id
        remaining = node_ids  # All pass for single-org demo
        
        check_time = (time.time() - start_time) * 1000
        return remaining, check_time
    
    def check2_compliance(self, node_ids: Set[str], compliance_clearance: List[str]) -> tuple[Set[str], float]:
        """Check 2: Compliance filtering"""
        start_time = time.time()
        
        remaining = set()
        blocked_tags = ["MNPI", "PHI", "CONFIDENTIAL"]
        
        # If user has clearance, they can see tagged nodes
        allowed_tags = set(compliance_clearance)
        
        for node_id in node_ids:
            node = self.get_node_details(node_id)
            if not node:
                continue
            
            tags = node.get("compliance_tags", [])
            # Check if any blocked tag is present AND user doesn't have clearance
            has_blocked = any(tag in blocked_tags for tag in tags)
            has_clearance = any(tag in allowed_tags for tag in tags)
            
            if not has_blocked or has_clearance:
                remaining.add(node_id)
        
        check_time = (time.time() - start_time) * 1000
        return remaining, check_time
    
    def check3_permission(self, node_ids: Set[str], permission_lookup: Dict[int, dict]) -> tuple[Set[str], float]:
        """Check 3: Permission ceiling"""
        start_time = time.time()
        
        remaining = set()
        
        for node_id in node_ids:
            node = self.get_node_details(node_id)
            if not node:
                continue
            
            # Get hierarchy level for this node
            hierarchy_level_id = node.get("hierarchy_level_id")
            if not hierarchy_level_id:
                continue
            
            # Get level number from hierarchy
            result = self.supabase.table("hierarchy_levels")\
                .select("level_number")\
                .eq("id", hierarchy_level_id)\
                .execute()
            
            if not result.data:
                continue
            
            level_number = result.data[0]["level_number"]
            
            # Check permission using O(1) lookup
            if permission_lookup.get(level_number, {}).get("can_read", False):
                remaining.add(node_id)
        
        check_time = (time.time() - start_time) * 1000
        return remaining, check_time
    
    def check4_temporal(self, node_ids: Set[str]) -> tuple[Set[str], float]:
        """Check 4: Temporal validity"""
        start_time = time.time()
        
        now = datetime.now()
        remaining = set()
        
        for node_id in node_ids:
            node = self.get_node_details(node_id)
            if not node:
                continue
            
            # Check status
            status = node.get("status")
            if status in ["SUPERSEDED", "EXPIRED"]:
                continue
            
            # Check valid_until
            valid_until = node.get("valid_until")
            if valid_until:
                # Parse if string, otherwise use as-is
                if isinstance(valid_until, str):
                    valid_until = datetime.fromisoformat(valid_until.replace("Z", "+00:00"))
                if valid_until < now:
                    continue
            
            remaining.add(node_id)
        
        check_time = (time.time() - start_time) * 1000
        return remaining, check_time
    
    def check5_derivability(self, node_ids: Set[str], threshold: float = 0.7) -> tuple[Set[str], float]:
        """Check 5: Derivability filtering"""
        start_time = time.time()
        
        remaining = set()
        
        for node_id in node_ids:
            node = self.get_node_details(node_id)
            if not node:
                continue
            
            derivability = node.get("derivability_score", 1.0)
            if derivability < threshold:
                remaining.add(node_id)
        
        check_time = (time.time() - start_time) * 1000
        return remaining, check_time
    
    def run_all_checks(
        self,
        node_ids: Set[str],
        org_id: str,
        compliance_clearance: List[str],
        permission_lookup: Dict[int, dict]
    ) -> tuple[Set[str], Dict[str, float]]:
        """Run all 5 checks sequentially"""
        timing = {}
        
        # Check 1: Isolation
        node_ids, timing["check1"] = self.check1_isolation(node_ids, org_id)
        
        # Check 2: Compliance
        node_ids, timing["check2"] = self.check2_compliance(node_ids, compliance_clearance)
        
        # Check 3: Permission
        node_ids, timing["check3"] = self.check3_permission(node_ids, permission_lookup)
        
        # Check 4: Temporal
        node_ids, timing["check4"] = self.check4_temporal(node_ids)
        
        # Check 5: Derivability
        node_ids, timing["check5"] = self.check5_derivability(node_ids)
        
        return node_ids, timing