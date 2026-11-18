
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Literal

from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance
from app.models.department import Department
from app.models.department_assignment import DepartmentAssignment
from app.models.grievance_history import GrievanceHistory
from app.utils.dependencies import get_current_officer
from app.utils.id_generator import generate_next_id

router = APIRouter(
    prefix="/api/officer",
    tags=["Officer Dashboard"]
)


class StatusUpdate(BaseModel):
    status: Literal[
        "Under Review",
        "In Progress",
        "Resolved",
        "Reopened"
    ]
    remarks: str = Field(min_length=3, max_length=1000)


@router.get("/grievances")
def get_assigned_grievances(
    db: Session = Depends(get_db),
    officer: User = Depends(get_current_officer)
):
    assignments = (
        db.query(DepartmentAssignment, Grievance, Department)
        .join(
            Grievance,
            DepartmentAssignment.grievance_id == Grievance.id
        )
        .join(
            Department,
            DepartmentAssignment.department_id == Department.id
        )
        .filter(DepartmentAssignment.officer_id == officer.id)
        .order_by(
            DepartmentAssignment.assigned_at.desc(),
            DepartmentAssignment.id.desc()
        )
        .all()
    )

    result = []

    for assignment, grievance, department in assignments:
        latest_assignment = (
            db.query(DepartmentAssignment)
            .filter(
                DepartmentAssignment.grievance_id == grievance.id
            )
            .order_by(
                DepartmentAssignment.assigned_at.desc(),
                DepartmentAssignment.id.desc()
            )
            .first()
        )

        if not latest_assignment or latest_assignment.id != assignment.id:
            continue

        result.append({
            "id": grievance.id,
            "grievance_id": grievance.id,
            "assignment_id": assignment.id,
            "reference_number": grievance.reference_number,
            "subject": grievance.subject,
            "description": grievance.description,
            "district": grievance.district,
            "category": grievance.category,
            "priority": grievance.priority,
            "status": grievance.status,
            "department": department.name,
            "assigned_at": (
                assignment.assigned_at.isoformat()
                if assignment.assigned_at else None
            )
        })

    return {
        "total": len(result),
        "grievances": result
    }


@router.patch("/grievances/{grievance_id}/status")
def update_grievance_status(
    grievance_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    officer: User = Depends(get_current_officer)
):
    grievance = (
        db.query(Grievance)
        .filter(Grievance.id == grievance_id)
        .first()
    )

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found"
        )

    assignment = (
        db.query(DepartmentAssignment)
        .filter(
            DepartmentAssignment.grievance_id == grievance_id
        )
        .order_by(
            DepartmentAssignment.assigned_at.desc(),
            DepartmentAssignment.id.desc()
        )
        .first()
    )

    if not assignment or assignment.officer_id != officer.id:
        raise HTTPException(
            status_code=403,
            detail="You are not assigned to this grievance"
        )

    old_status = grievance.status

    history = GrievanceHistory(
        id=generate_next_id(db, GrievanceHistory),
        grievance_id=grievance.id,
        changed_by=officer.id,
        old_status=old_status,
        new_status=data.status,
        remarks=data.remarks
    )

    try:
        grievance.status = data.status
        db.add(history)
        db.commit()
        db.refresh(grievance)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update grievance status"
        )

    return {
        "message": "Grievance status updated successfully",
        "grievance_id": grievance.id,
        "reference_number": grievance.reference_number,
        "old_status": old_status,
        "new_status": grievance.status,
        "remarks": data.remarks
    }
