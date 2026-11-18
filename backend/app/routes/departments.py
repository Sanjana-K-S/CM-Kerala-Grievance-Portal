from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.department import Department

router = APIRouter(prefix="/api/departments", tags=["Departments"])


@router.get("/")
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).order_by(Department.name).all()

    return [
        {
            "id": department.id,
            "name": department.name,
            "description": department.description
        }
        for department in departments
    ]