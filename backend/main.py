from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, projects, tasks
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Team Task Manager API (MongoDB)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://team-task-manager-sigma-eight.vercel.app",
        "https://team-task-manager-f21yyquc4-ayush-tiwaris-projects-4d7f4424.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
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
import os

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
