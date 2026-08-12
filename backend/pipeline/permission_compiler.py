import time
from typing import Dict, List
from models.user import User

class PermissionCompiler:
    """Compiles user permissions into O(1) lookup structure"""
    
    @staticmethod
    def compile(user: User) -> tuple[Dict[int, dict], float]:
        start_time = time.time()
        
        # Build permission lookup for all 15 levels
        permission_lookup = {}
        
        for level in range(1, 16):
            can_read = False
            can_write = False
            
            if user.role == "ADMIN":
                can_read = True
                can_write = True
            elif user.role == "HOD":
                # HOD can read all levels above their ceiling (lower number = higher access)
                can_read = level >= user.ceiling_level
                can_write = level >= user.write_ceiling if user.write_ceiling else False
            elif user.role == "EDITOR":
                can_read = level >= user.ceiling_level
                can_write = level >= user.write_ceiling if user.write_ceiling else False
            elif user.role in ["VIEWER", "QUALITY"]:
                can_read = level >= user.ceiling_level
                can_write = False
            elif user.role == "AUDITOR":
                can_read = level >= user.ceiling_level
                can_write = False
            
            permission_lookup[level] = {
                "can_read": can_read,
                "can_write": can_write
            }
        
        compile_time = (time.time() - start_time) * 1000  # ms
        return permission_lookup, compile_time