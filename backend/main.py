from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from models.user import User
from models.candidate_set import CandidateSet
from pipeline.pipeline import RulesEnginePipeline

load_dotenv()

app = FastAPI(title="BRAHMO Rules Engine", version="1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Initialize pipeline
pipeline = RulesEnginePipeline(supabase)

# Request/Response models
class RunPipelineRequest(BaseModel):
    user_id: str

class UserResponse(BaseModel):
    id: str
    name: str
    role: str
    department: str
    ceiling_level: int

@app.get("/")
async def root():
    return {"message": "BRAHMO Rules Engine API", "status": "running"}

@app.get("/api/users")
async def get_users():
    """Get all available users"""
    result = supabase.table("users").select("*").execute()
    return result.data

@app.post("/api/pipeline/run")
async def run_pipeline(request: RunPipelineRequest):
    """Run the full pipeline for a given user"""

    
    # Get user details
    result = supabase.table("users").select("*").eq("id", request.user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = result.data[0]
    user = User(**user_data)
    
    # Run pipeline
    try:
        candidate_set = pipeline.run(user)
        return candidate_set.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/nodes")
async def get_nodes():
    """Get all knowledge nodes for visualization"""
    result = supabase.table("knowledge_nodes").select("*").execute()
    return result.data

@app.get("/api/hierarchy")
async def get_hierarchy():
    """Get hierarchy structure for visualization"""
    result = supabase.table("hierarchy_levels").select("*").execute()
    return result.data

@app.get("/api/edges")
async def get_edges():
    """Get edges for graph visualization"""
    result = supabase.table("edges").select("*").execute()
    return result.data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)