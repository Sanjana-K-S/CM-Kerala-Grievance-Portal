
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine

# Models
from app.models.user import User
from app.models.department import Department
from app.models.grievance import Grievance
from app.models.department_assignment import DepartmentAssignment
from app.models.grievance_history import GrievanceHistory
from app.models.attachment import Attachment
from app.models.feedback import CitizenFeedback
from app.models.contact_enquiry import ContactEnquiry

# Routers
from app.routes.auth import router as auth_router
from app.routes.grievances import router as grievances_router
from app.routes import departments
from app.routes import assignments
from app.routes import officer
from app.routes import admin
from app.routes import attachments
from app.routes.feedback import router as feedback_router
from app.routes.contact import router as contact_router
from app.routes import ai

app = FastAPI(
    title="CM Kerala Grievance Redressal Portal",
    description="Public Grievance Management Recruitment Prototype",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://cm-kerala-grievance-portal-steel.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(grievances_router)
app.include_router(departments.router)
app.include_router(assignments.router)
app.include_router(officer.router)
app.include_router(admin.router)
app.include_router(attachments.router)
app.include_router(feedback_router)
app.include_router(contact_router)
app.include_router(ai.router)


@app.get("/")
def home():
    return {
        "message": "CM Kerala Grievance Portal API is running",
        "status": "success"
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}


@app.get("/api/db-check")
def database_check():
    try:
        with engine.connect() as connection:
            database = connection.execute(
                text("SELECT DATABASE()")
            ).scalar()

            tables = connection.execute(
                text("SHOW TABLES")
            ).fetchall()

        return {
            "status": "connected",
            "database": database,
            "table_count": len(tables),
            "tables": [table[0] for table in tables]
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(error)}"
        )
