
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.grievance import Grievance
from app.models.user import User
from app.models.department import Department
from app.models.department_assignment import DepartmentAssignment
from app.utils.dependencies import get_current_admin

router = APIRouter(
    prefix="/api/admin",
    tags=["CMO Admin Dashboard"]
)


# 1. Dashboard statistics
@router.get("/dashboard")
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    grievances = db.query(Grievance).all()

    total = len(grievances)
    submitted = sum(
        1 for g in grievances if g.status == "Submitted"
    )
    under_review = sum(
        1 for g in grievances if g.status == "Under Review"
    )
    in_progress = sum(
        1 for g in grievances if g.status == "In Progress"
    )
    resolved = sum(
        1 for g in grievances if g.status == "Resolved"
    )
    reopened = sum(
    1 for g in grievances if g.status == "Reopened"
)

    pending = submitted + under_review

    department_stats = (
        db.query(
            Department.id,
            Department.name,
            func.count(DepartmentAssignment.id).label("assigned_count")
        )
        .outerjoin(
            DepartmentAssignment,
            Department.id == DepartmentAssignment.department_id
        )
        .group_by(Department.id, Department.name)
        .order_by(Department.name)
        .all()
    )

    return {
        "total_grievances": total,
        "submitted": submitted,
        "under_review": under_review,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "reopened": reopened,
        "department_statistics": [
            {
                "department_id": row.id,
                "department_name": row.name,
                "assigned_count": row.assigned_count
            }
            for row in department_stats
        ]
    }


# 2. View all grievances
@router.get("/grievances")
def get_all_grievances(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    grievances = (
        db.query(Grievance, User)
        .join(User, Grievance.citizen_id == User.id)
        .order_by(Grievance.created_at.desc())
        .all()
    )

    result = []

    for grievance, citizen in grievances:
        assignment = (
            db.query(DepartmentAssignment, Department, User)
            .join(
                Department,
                DepartmentAssignment.department_id == Department.id
            )
            .outerjoin(
                User,
                DepartmentAssignment.officer_id == User.id
            )
            .filter(
                DepartmentAssignment.grievance_id == grievance.id
            )
            .order_by(
                DepartmentAssignment.assigned_at.desc(),
                DepartmentAssignment.id.desc()
            )
            .first()
        )

        result.append({
            "id": grievance.id,
            "reference_number": grievance.reference_number,
            "citizen_name": citizen.name,
            "district": grievance.district,
            "category": grievance.category,
            "subject": grievance.subject,
            "description": grievance.description,
            "priority": grievance.priority,
            "status": grievance.status,
            "department": assignment[1].name if assignment else None,
            "officer": assignment[2].name if assignment and assignment[2] else None,
            "created_at": (
                grievance.created_at.isoformat()
                if grievance.created_at else None
            )
        })

    return {
        "total": len(result),
        "grievances": result
    }


# 3. Get officers, optionally filtered by department
@router.get("/officers")
def get_officers(
    department_id: int = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    query = db.query(User).filter(User.role == "officer")

    if department_id is not None:
        department = db.query(Department).filter(
            Department.id == department_id
        ).first()

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

        query = query.filter(
            User.department_id == department_id
        )

    officers = query.order_by(User.name).all()

    return {
        "total": len(officers),
        "officers": [
            {
                "id": officer.id,
                "name": officer.name,
                "email": officer.email,
                "department_id": officer.department_id
            }
            for officer in officers
        ]
    }
