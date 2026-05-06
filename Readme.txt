# 🚀 Team Task Manager

A modern **full-stack project management application** designed to streamline team collaboration, task tracking, and role-based workflows with a clean and responsive UI.

---

## ✨ Overview

Team Task Manager enables teams to efficiently manage projects and tasks with secure authentication and role-based access control. It provides a seamless experience for both administrators and team members to collaborate in real time.

---

## 🔥 Key Features

### 🔐 Authentication & Security

* JWT-based secure authentication system
* Role-based access control (RBAC)
* Protected API routes

### 👥 Role Management

* **Admin**

  * Create and manage projects
  * Assign tasks
* **Member**

  * Update task status
  * Track assigned work

### 📁 Project Management

* Create and organize multiple projects
* View project-level task summaries

### ✅ Task Management

* Assign tasks to users
* Track progress with statuses:

  * To Do
  * In Progress
  * Done

### 📊 Dashboard

* Centralized overview of:

  * Projects
  * Tasks
  * Progress

### 🎨 UI/UX Design

* Glassmorphism-based modern UI
* Smooth animations
* Responsive design
* Dynamic gradients

---

## 🛠️ Tech Stack

### 🔹 Backend

* FastAPI (Python)
* SQLAlchemy / MongoDB (depending on setup)
* JWT Authentication
* SQLite (development) / PostgreSQL or MongoDB (production)

### 🔹 Frontend

* React (Vite)
* React Router
* Axios
* Vanilla CSS

### 🔹 Deployment

* Backend: Railway
* Frontend: Railway / Vercel

---

## 📂 Project Structure

```bash
project/
│── backend/
│── frontend/
│── README.md
```

---

## ⚙️ Local Development Setup

### 🔧 Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
# OR
source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

👉 Backend runs on:
http://localhost:8000

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

👉 Frontend runs on:
http://localhost:5173

---

## 🌐 Deployment Guide (Railway)

This project is structured for **monorepo deployment** using Railway.

---

### 🚆 Backend Deployment

* Root Directory: `/backend`
* Build Command:

```bash
pip install -r requirements.txt
```

* Start Command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

### 🎯 Frontend Deployment

* Root Directory: `/frontend`
* Build Command:

```bash
npm run build
```

* Start Command:

```bash
npm run preview -- --host 0.0.0.0 --port $PORT
```

---


## 👨‍💻 Author

**Ayush Tiwari**
B.Tech CSE (AI)
Aspiring AI/Full-Stack Developer

---

