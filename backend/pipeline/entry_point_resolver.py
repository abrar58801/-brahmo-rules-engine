import time
from typing import Optional
from supabase import Client

class EntryPointResolver:
    """Resolves user's department to DAG entry point"""
    
    @staticmethod
    def resolve(supabase: Client, user_department: str, user_ceiling: int) -> tuple[Optional[str], float]:
        start_time = time.time()
        
        # Map department to hierarchy level
        # In production, this would query the database
        dept_to_level = {
            "ortho": "HL-10-ORTHO-W",
            "medicine": "HL-10-MED-W",
            "cardiology": "HL-08-CARDIO-CCU",
            "paediatrics": "HL-10-PAEDS-W",
            "pharmacy": "HL-10-ORTHO-W",  # Pharmacist sees Ortho Ward
            "quality": "HL-05-ORTHO",
            "admin": "HL-01",
            "surgery": "HL-05-SURG",
            "icu": "HL-05-ICU"
        }
        
        entry_point = dept_to_level.get(user_department)
        
        # If HOD, enter at department level
        # This is handled by using a different entry point
        # For simplicity, we use the mapping above
        
        resolve_time = (time.time() - start_time) * 1000
        return entry_point, resolve_time