from fastapi import APIRouter, Depends, HTTPException
from typing import List
import schemas
from database import get_db
from routes.auth import get_current_user, require_admin
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[schemas.TaskOut])
async def read_tasks(project_id: str = None, skip: int = 0, limit: int = 100, db = Depends(get_db), current_user = Depends(get_current_user)):
    query = {}
    if project_id:
        query["project_id"] = project_id
        
    tasks = await db.tasks.find(query).skip(skip).limit(limit).to_list(100)
    return tasks

@router.post("/", response_model=schemas.TaskOut)
async def create_task(task: schemas.TaskCreate, db = Depends(get_db), current_user = Depends(require_admin)):
    if not ObjectId.is_valid(task.project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID format")
        
    project = await db.projects.find_one({"_id": ObjectId(task.project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task_dict = task.model_dump()
    task_dict["created_at"] = datetime.utcnow()
    
    new_task = await db.tasks.insert_one(task_dict)
    created_task = await db.tasks.find_one({"_id": new_task.inserted_id})
    return created_task

@router.put("/{task_id}", response_model=schemas.TaskOut)
async def update_task(task_id: str, task_update: schemas.TaskUpdate, db = Depends(get_db), current_user = Depends(get_current_user)):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID format")
        
    existing_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if existing_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.model_dump(exclude_unset=True)
    
    # Check permissions: Admin can update anything, Member can only update status
    if current_user.get("role") != "Admin":
        if set(update_data.keys()) - {"status"}:
            raise HTTPException(status_code=403, detail="Members can only update task status")

    if update_data:
        await db.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        
    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return updated_task

@router.delete("/{task_id}")
async def delete_task(task_id: str, db = Depends(get_db), current_user = Depends(require_admin)):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID format")
        
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"ok": True}
