export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  ceiling_level: number;
  compliance_clearance: string[];
}

export interface CandidateNode {
  id: string;
  type: string;
  title: string;
  content: string;
  importance: number;
  zone: number;
  hierarchy_level: number;
  department: string | null;
  distance_from_entry: number;
  compression_hint: string;
}

export interface PipelineTiming {
  permission_compile_ms: number;
  bfs_ms: number;
  zone2_inject_ms: number;
  check1_isolation_ms: number;
  check2_compliance_ms: number;
  check3_permission_ms: number;
  check4_temporal_ms: number;
  check5_derivability_ms: number;
  total_ms: number;
}

export interface FunnelStats {
  total_nodes: number;
  after_bfs: number;
  after_zone2: number;
  after_check1: number;
  after_check2: number;
  after_check3: number;
  after_check4: number;
  after_check5: number;
}

export interface CandidateSet {
  user_id: string;
  user_name: string;
  role: string;
  ceiling_level: number;
  entry_point: string;
  pipeline_timing: PipelineTiming;
  funnel: FunnelStats;
  candidate_set: CandidateNode[];
  timestamp: string;
}

export interface Node {
  id: string;
  org_id: string;
  hierarchy_level_id: string;
  type: string;
  title: string;
  content: string;
  importance: number;
  zone: number;
  status: string;
  derivability_score: number;
  compliance_tags: string[];
  department: string | null;
}

export interface HierarchyLevel {
  id: string;
  org_id: string;
  level_number: number;
  level_name: string;
  department: string | null;
  parent_ids: string[];
  zone: number;
}