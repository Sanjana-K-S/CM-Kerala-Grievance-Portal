
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.grievance import Grievance
from app.models.user import User
from app.models.department import Department
from app.models.department_assignment import DepartmentAssignment
from app.models.grievance_history import GrievanceHistory
from app.schemas.grievance import GrievanceCreate
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/grievances",
    tags=["Grievances"]
)


def generate_reference_number(db: Session):
    for _ in range(10):
        reference = (
            f"CMK-{datetime.now().strftime('%Y%m%d')}-"
            f"{secrets.token_hex(4).upper()}"
        )

        existing = db.query(Grievance).filter(
            Grievance.reference_number == reference
        ).first()

        if not existing:
            return reference

    raise HTTPException(
        status_code=500,
        detail="Could not generate a grievance reference number"
    )


def generate_grievance_id(db: Session):
    return (
        db.query(func.max(Grievance.id)).scalar() or 0
    ) + 1


# 1. Submit a grievance
@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_grievance(
    data: GrievanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only citizens can submit grievances"
        )

    reference_number = generate_reference_number(db)

    grievance = Grievance(
        id=generate_grievance_id(db),
        reference_number=reference_number,
        citizen_id=current_user.id,
        district=data.district,
        category=data.category,
        subject=data.subject,
        description=data.description,
        priority=data.priority,
        status="Submitted"
    )

    try:
        db.add(grievance)
        db.commit()
        db.refresh(grievance)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Could not save grievance. Please try again."
        )

    return {
        "message": "Grievance submitted successfully",
        "grievance": {
            "id": grievance.id,
            "reference_number": grievance.reference_number,
            "district": grievance.district,
            "category": grievance.category,
            "subject": grievance.subject,
            "description": grievance.description,
            "priority": grievance.priority,
            "status": grievance.status,
            "created_at": (
                grievance.created_at.isoformat()
                if grievance.created_at else None
            )
        }
    }


# 2. Get all grievances belonging to the logged-in citizen
@router.get("/my")
def get_my_grievances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    grievances = (
        db.query(Grievance)
        .filter(Grievance.citizen_id == current_user.id)
        .order_by(Grievance.created_at.desc())
        .all()
    )

    return {
        "total": len(grievances),
        "grievances": [
            {
                "id": grievance.id,
                "reference_number": grievance.reference_number,
                "district": grievance.district,
                "category": grievance.category,
                "subject": grievance.subject,
                "description": grievance.description,
                "priority": grievance.priority,
                "status": grievance.status,
                "created_at": (
                    grievance.created_at.isoformat()
                    if grievance.created_at else None
                ),
                "updated_at": (
                    grievance.updated_at.isoformat()
                    if grievance.updated_at else None
                )
            }
            for grievance in grievances
        ]
    }


# 3. Track a grievance using its reference number
@router.get("/track/{reference_number}")
def track_grievance(
    reference_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    grievance = (
        db.query(Grievance)
        .filter(
            Grievance.reference_number == reference_number,
            Grievance.citizen_id == current_user.id
        )
        .first()
    )

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found"
        )

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

    history_records = (
        db.query(GrievanceHistory, User)
        .join(
            User,
            GrievanceHistory.changed_by == User.id
        )
        .filter(
            GrievanceHistory.grievance_id == grievance.id
        )
        .order_by(
            GrievanceHistory.created_at.asc(),
            GrievanceHistory.id.asc()
        )
        .all()
    )

    assigned_department = (
        assignment[1].name if assignment else None
    )

    assigned_officer = (
        assignment[2].name
        if assignment and assignment[2]
        else None
    )

    return {
        "message": "Grievance details retrieved successfully",
        "grievance": {
            "id": grievance.id,
            "reference_number": grievance.reference_number,
            "district": grievance.district,
            "category": grievance.category,
            "subject": grievance.subject,
            "description": grievance.description,
            "priority": grievance.priority,
            "status": grievance.status,
            "department": assigned_department,
            "assigned_department": assigned_department,
            "assigned_officer": assigned_officer,
            "created_at": (
                grievance.created_at.isoformat()
                if grievance.created_at else None
            ),
            "updated_at": (
                grievance.updated_at.isoformat()
                if grievance.updated_at else None
            ),
            "history": [
                {
                    "id": record.id,
                    "old_status": record.old_status,
                    "new_status": record.new_status,
                    "remarks": record.remarks,
                    "updated_by": user.name,
                    "updated_at": (
                        record.created_at.isoformat()
                        if record.created_at else None
                    )
                }
                for record, user in history_records
            ]
        }
    }
