from fastapi import APIRouter, Depends, HTTPException
from typing import List
import schemas
from database import get_db
from routes.auth import get_current_user, require_admin
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[schemas.ProjectOut])
async def read_projects(skip: int = 0, limit: int = 100, db = Depends(get_db), current_user = Depends(get_current_user)):
    projects = await db.projects.find().skip(skip).limit(limit).to_list(100)
    return projects

@router.post("/", response_model=schemas.ProjectOut)
async def create_project(project: schemas.ProjectCreate, db = Depends(get_db), current_user = Depends(require_admin)):
    project_dict = project.model_dump()
    project_dict["owner_id"] = str(current_user["_id"])
    project_dict["created_at"] = datetime.utcnow()
    
    new_project = await db.projects.insert_one(project_dict)
    created_project = await db.projects.find_one({"_id": new_project.inserted_id})
    return created_project

@router.get("/{project_id}", response_model=schemas.ProjectOut)
async def read_project(project_id: str, db = Depends(get_db), current_user = Depends(get_current_user)):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Also fetch tasks for this project
    tasks = await db.tasks.find({"project_id": project_id}).to_list(100)
    project["tasks"] = tasks
    return project
