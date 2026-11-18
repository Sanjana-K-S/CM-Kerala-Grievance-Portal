
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.feedback import CitizenFeedback
from app.models.grievance import Grievance
from app.utils.dependencies import get_current_user
from app.utils.id_generator import generate_next_id

router = APIRouter(
    prefix="/api/feedback",
    tags=["Citizen Feedback"]
)


class FeedbackCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comments: Optional[str] = Field(default=None, max_length=2000)


@router.post("/{grievance_id}", status_code=status.HTTP_201_CREATED)
def submit_feedback(
    grievance_id: int,
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "citizen":
        raise HTTPException(
            status_code=403,
            detail="Only citizens can submit feedback."
        )

    grievance = db.query(Grievance).filter(
        Grievance.id == grievance_id,
        Grievance.citizen_id == current_user.id
    ).first()

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found."
        )

    if grievance.status != "Resolved":
        raise HTTPException(
            status_code=400,
            detail="Feedback can only be submitted for resolved grievances."
        )

    existing = db.query(CitizenFeedback).filter(
        CitizenFeedback.grievance_id == grievance_id,
        CitizenFeedback.citizen_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Feedback has already been submitted for this grievance."
        )

    feedback = CitizenFeedback(
        id=generate_next_id(db, CitizenFeedback),
        grievance_id=grievance_id,
        citizen_id=current_user.id,
        rating=data.rating,
        comments=data.comments
    )

    try:
        db.add(feedback)
        db.commit()
        db.refresh(feedback)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to submit feedback."
        )

    return {
        "message": "Feedback submitted successfully.",
        "feedback": {
            "id": feedback.id,
            "grievance_id": feedback.grievance_id,
            "rating": feedback.rating,
            "comments": feedback.comments,
            "created_at": (
                feedback.created_at.isoformat()
                if feedback.created_at else None
            )
        }
    }


@router.get("/my")
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    feedback_list = db.query(CitizenFeedback).filter(
        CitizenFeedback.citizen_id == current_user.id
    ).order_by(CitizenFeedback.created_at.desc()).all()

    return {
        "total": len(feedback_list),
        "feedback": [
            {
                "id": item.id,
                "grievance_id": item.grievance_id,
                "rating": item.rating,
                "comments": item.comments,
                "created_at": (
                    item.created_at.isoformat()
                    if item.created_at else None
                )
            }
            for item in feedback_list
        ]
    }
