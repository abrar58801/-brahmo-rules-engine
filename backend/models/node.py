from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class KnowledgeNode(BaseModel):
    id: str
    org_id: str
    hierarchy_level_id: str
    type: str  # CONSTRAINT, DECISION, ANTI_PATTERN, FACT
    title: str
    content: str
    importance: float
    zone: int  # 1=Addressed, 2=Global, 3=Floating
    status: str  # ACTIVE, REVIEW_REQUIRED, SUPERSEDED, EXPIRED, LEGAL_HOLD
    derivability_score: float
    compliance_tags: List[str] = []
    valid_until: Optional[datetime] = None
    superseded_by: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime