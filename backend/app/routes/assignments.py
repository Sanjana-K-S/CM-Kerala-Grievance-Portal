
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance
from app.models.department import Department
from app.models.department_assignment import DepartmentAssignment
from app.utils.dependencies import get_current_admin

router = APIRouter(
    prefix="/api/assignments",
    tags=["Grievance Assignments"]
)


class AssignmentCreate(BaseModel):
    grievance_id: int = Field(gt=0)
    department_id: int = Field(gt=0)
    officer_id: int = Field(gt=0)


@router.post("/", status_code=status.HTTP_201_CREATED)
def assign_grievance(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    # Check whether grievance exists
    grievance = db.query(Grievance).filter(
        Grievance.id == data.grievance_id
    ).first()

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found"
        )

    # Check whether department exists
    department = db.query(Department).filter(
        Department.id == data.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    # Check whether officer exists
    officer = db.query(User).filter(
        User.id == data.officer_id
    ).first()

    if not officer:
        raise HTTPException(
            status_code=404,
            detail="Officer not found"
        )

    # Validate officer role and department
    if officer.role != "officer":
        raise HTTPException(
            status_code=400,
            detail="Selected user is not a department officer"
        )

    if officer.department_id != department.id:
        raise HTTPException(
            status_code=400,
            detail="Officer does not belong to the selected department"
        )

    # Create assignment
    assignment = DepartmentAssignment(
        grievance_id=grievance.id,
        department_id=department.id,
        officer_id=officer.id,
        assigned_by=admin.id
    )

    try:
        db.add(assignment)
        db.commit()
        db.refresh(assignment)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to assign grievance"
        )

    return {
        "message": "Grievance assigned successfully",
        "assignment": {
            "id": assignment.id,
            "grievance_id": assignment.grievance_id,
            "department_id": assignment.department_id,
            "department_name": department.name,
            "officer_id": assignment.officer_id,
            "officer_name": officer.name,
            "assigned_by": assignment.assigned_by,
            "assigned_at": assignment.assigned_at
        }
    }
