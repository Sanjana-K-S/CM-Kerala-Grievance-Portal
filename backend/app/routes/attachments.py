
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.grievance import Grievance
from app.models.attachment import Attachment
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/api/attachments",
    tags=["Grievance Attachments"]
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
}


@router.post("/{grievance_id}")
async def upload_attachment(
    grievance_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    grievance = (
        db.query(Grievance)
        .filter(
            Grievance.id == grievance_id,
            Grievance.citizen_id == current_user.id
        )
        .first()
    )

    if not grievance:
        raise HTTPException(
            status_code=404,
            detail="Grievance not found"
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, WEBP and PDF files are allowed"
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Empty files are not allowed"
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 5 MB"
        )

    extension = Path(file.filename or "").suffix.lower()

    if extension not in {".jpg", ".jpeg", ".png", ".webp", ".pdf"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid file extension"
        )

    safe_name = f"{uuid.uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / safe_name

    try:
        with open(file_path, "wb") as output:
            output.write(content)

        attachment = Attachment(
            grievance_id=grievance.id,
            file_name=os.path.basename(file.filename or "attachment"),
            file_path=str(file_path).replace("\\", "/")
        )

        db.add(attachment)
        db.commit()
        db.refresh(attachment)

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail="Unable to upload attachment"
        )

    return {
        "message": "Attachment uploaded successfully",
        "attachment": {
            "id": attachment.id,
            "grievance_id": attachment.grievance_id,
            "file_name": attachment.file_name,
            "uploaded_at": attachment.uploaded_at.isoformat()
        }
    }


@router.get("/{grievance_id}")
def get_attachments(
    grievance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
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

    # Citizens can view only their own attachments.
    # Staff can view attachments of grievances assigned to them.
    if current_user.role == "citizen":
        if grievance.citizen_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    elif current_user.role == "officer":
        from app.models.department_assignment import DepartmentAssignment

        assignment = (
            db.query(DepartmentAssignment)
            .filter(
                DepartmentAssignment.grievance_id == grievance_id,
                DepartmentAssignment.officer_id == current_user.id
            )
            .first()
        )

        if not assignment:
            raise HTTPException(status_code=403, detail="Access denied")

    elif current_user.role != "cmo_admin":
        raise HTTPException(status_code=403, detail="Access denied")

    attachments = (
        db.query(Attachment)
        .filter(Attachment.grievance_id == grievance_id)
        .order_by(Attachment.uploaded_at.desc())
        .all()
    )

    return {
        "total": len(attachments),
        "attachments": [
            {
                "id": item.id,
                "file_name": item.file_name,
                "uploaded_at": (
                    item.uploaded_at.isoformat()
                    if item.uploaded_at else None
                )
            }
            for item in attachments
        ]
    }
