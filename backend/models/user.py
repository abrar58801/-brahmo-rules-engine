from pydantic import BaseModel
from typing import List, Optional

class User(BaseModel):
    id: str
    org_id: str
    name: str
    role: str  # ADMIN, HOD, EDITOR, VIEWER, QUALITY, AUDITOR
    department: str
    ceiling_level: int
    write_ceiling: Optional[int] = None
    compliance_clearance: List[str] = []
    status: str = "ACTIVE"

class PermissionLookup(BaseModel):
    level: int
    can_read: bool
    can_write: bool