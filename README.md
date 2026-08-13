# BRAHMO Rules Engine — BFS Traversal + 5-Check Filter Pipeline

## 📋 Overview
This project implements a zero-LLM, deterministic Rules Engine that traverses a Directed Acyclic Graph (DAG) of healthcare knowledge nodes. It applies 5 sequential filters to produce a secure, user-specific candidate set for downstream AI consumption. Built with **Next.js (React)**, **FastAPI (Python)**, and **Supabase (PostgreSQL)**.

## 🚀 Local Setup Instructions

### 1. Database (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open your project's **SQL Editor**.
3. Run the `supabase/schema.sql` file to create the tables.
4. Run the `supabase/seed.sql` file to populate the 50 seed nodes, 7 users, and hierarchy.
5. Go to Project Settings -> API. Copy your **Project URL** and **Anon Key**.

### 2. Backend (Python + FastAPI)
Open a terminal and run the following commands:

```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn supabase python-dotenv python-multipart

# Create .env file (Add your Supabase URL and Service Role Key here)
echo "SUPABASE_URL=your_url_here" > .env
echo "SUPABASE_SERVICE_KEY=your_service_role_key_here" >> .env

# Start the server
uvicorn main:app --reload --port 8000
