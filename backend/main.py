from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, projects, tasks
from dotenv import load_dotenv
import os
import re

load_dotenv()

app = FastAPI(title="Team Task Manager API (MongoDB)")


origins = [
    "https://team-task-manager-sigma-eight.vercel.app",  
    "http://localhost:5173",
    "http://localhost:3000",
]

class DynamicCORSMiddleware(CORSMiddleware):
    async def is_origin_allowed(self, origin: str) -> bool:
        # Allow all *.vercel.app subdomains for your project
        if re.match(r"https://team-task-manager-.*\.vercel\.app", origin):
            return True
        return origin in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://team-task-manager-.*\.vercel\.app",  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Team Task Manager API (MongoDB backend)!"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port)