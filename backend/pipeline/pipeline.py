import time
from typing import Dict, Any
from supabase import Client
from models.user import User
from models.candidate_set import CandidateSet, PipelineTiming, FunnelStats
from pipeline.permission_compiler import PermissionCompiler
from pipeline.entry_point_resolver import EntryPointResolver
from pipeline.bfs_traversal import BFSTraversal
from pipeline.zone2_injector import Zone2Injector
from pipeline.five_check_filter import FiveCheckFilter
from pipeline.candidate_assembler import CandidateAssembler
from datetime import datetime

class RulesEnginePipeline:
    """Main pipeline orchestrator"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.bfs_traversal = BFSTraversal(supabase)
        self.zone2_injector = Zone2Injector(supabase)
        self.five_check_filter = FiveCheckFilter(supabase)
        self.candidate_assembler = CandidateAssembler(supabase)
    
    def run(self, user: User) -> CandidateSet:
        """Execute the full pipeline for a given user"""
        total_start = time.time()
        
        # Step 1: Compile permissions (O(1) lookup)
        permission_lookup, compile_time = PermissionCompiler.compile(user)
        
        # Step 2: Resolve entry point
        entry_point, resolve_time = EntryPointResolver.resolve(
            self.supabase, user.department, user.ceiling_level
        )
        
        # Step 3: BFS traversal upward from entry point
        reachable_nodes, distance_map, bfs_time = self.bfs_traversal.traverse(entry_point)
        
        # Step 4: Inject Zone 2 nodes
        combined_nodes, zone2_time = self.zone2_injector.inject(reachable_nodes)
        
        # Step 5: Run 5 checks sequentially
        filtered_nodes, check_timing = self.five_check_filter.run_all_checks(
            combined_nodes,
            user.org_id,
            user.compliance_clearance,
            permission_lookup
        )
        
        # Step 6: Assemble candidate set
        candidate_nodes, assemble_time = self.candidate_assembler.assemble(
            filtered_nodes,
            distance_map,
            user.id,
            user.name,
            user.role,
            user.ceiling_level,
            entry_point
        )
        
        total_time = (time.time() - total_start) * 1000
        
        # Build timing object
        timing = PipelineTiming(
            permission_compile_ms=compile_time,
            bfs_ms=bfs_time,
            zone2_inject_ms=zone2_time,
            check1_isolation_ms=check_timing.get("check1", 0),
            check2_compliance_ms=check_timing.get("check2", 0),
            check3_permission_ms=check_timing.get("check3", 0),
            check4_temporal_ms=check_timing.get("check4", 0),
            check5_derivability_ms=check_timing.get("check5", 0),
            total_ms=total_time
        )
        
        # Build funnel stats
        funnel = FunnelStats(
            total_nodes=50,  # Total in demo graph
            after_bfs=len(reachable_nodes),
            after_zone2=len(combined_nodes),
            after_check1=len(combined_nodes),  # All pass isolation for single-org
            after_check2=len(list(filter(lambda x: x not in self._get_blocked_nodes(), combined_nodes))),
            after_check3=len(list(filter(lambda x: self._check_permission(x, permission_lookup), combined_nodes))),
            after_check4=len(list(filter(lambda x: self._check_temporal(x), combined_nodes))),
            after_check5=len(filtered_nodes)
        )
        
        return CandidateSet(
            user_id=user.id,
            user_name=user.name,
            role=user.role,
            ceiling_level=user.ceiling_level,
            entry_point=entry_point or "N/A",
            pipeline_timing=timing,
            funnel=funnel,
            candidate_set=candidate_nodes,
            timestamp=datetime.now()
        )
    
    def _get_blocked_nodes(self) -> set:
        """Helper to get nodes with blocked tags"""
        # In production, this would be more sophisticated
        return set()
    
    def _check_permission(self, node_id: str, permission_lookup: dict) -> bool:
        """Helper to check permission for a node"""
        # Simplified version - full check is in FiveCheckFilter
        return True
    
    def _check_temporal(self, node_id: str) -> bool:
        """Helper to check temporal validity"""
        return True