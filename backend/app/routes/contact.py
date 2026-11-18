
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contact_enquiry import ContactEnquiry
from app.models.contact_email_otp import ContactEmailOTP
from app.utils.dependencies import get_current_admin
from app.utils.id_generator import generate_next_id

router = APIRouter(prefix="/api/contact", tags=["Contact Enquiries"])


class ContactEnquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=255)
    message: str = Field(min_length=10, max_length=5000)


class OTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")


class EnquiryUpdate(BaseModel):
    status: Literal["Pending", "In Progress", "Responded"]
    admin_response: str | None = Field(default=None, max_length=5000)


def hash_otp(otp):
    return hashlib.sha256(otp.encode()).hexdigest()


@router.post("/send-otp")
def send_otp(data: ContactEnquiryCreate, db: Session = Depends(get_db)):
    email = str(data.email).lower()

    db.query(ContactEmailOTP).filter(
        ContactEmailOTP.email == email
    ).delete(synchronize_session=False)

    otp = f"{secrets.randbelow(1000000):06d}"

    record = ContactEmailOTP(
        id=generate_next_id(db, ContactEmailOTP),
        email=email,
        otp_hash=hash_otp(otp),
        name=data.name,
        subject=data.subject,
        message=data.message,
        expires_at=datetime.utcnow() + timedelta(minutes=5)
    )

    try:
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to generate OTP."
        )

    # DEMO MODE ONLY: OTP is returned to the frontend.
    return {
        "message": "Demo OTP generated successfully.",
        "demo_mode": True,
        "demo_otp": otp
    }


@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    email = str(data.email).lower()

    record = (
        db.query(ContactEmailOTP)
        .filter(ContactEmailOTP.email == email)
        .order_by(ContactEmailOTP.id.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Request a new OTP."
        )

    if datetime.utcnow() > record.expires_at:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="OTP expired. Request a new one."
        )

    if not secrets.compare_digest(record.otp_hash, hash_otp(data.otp)):
        raise HTTPException(
            status_code=400,
            detail="Incorrect OTP."
        )

    enquiry = ContactEnquiry(
        id=generate_next_id(db, ContactEnquiry),
        name=record.name,
        email=record.email,
        subject=record.subject,
        message=record.message,
        status="Pending",
        email_verified=True
    )

    try:
        db.add(enquiry)
        db.delete(record)
        db.commit()
        db.refresh(enquiry)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to submit enquiry."
        )

    return {
        "message": "Enquiry submitted successfully.",
        "enquiry_id": enquiry.id,
        "status": enquiry.status
    }


@router.get("/admin")
def get_all_enquiries(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    enquiries = (
        db.query(ContactEnquiry)
        .order_by(ContactEnquiry.created_at.desc())
        .all()
    )

    return {
        "total": len(enquiries),
        "enquiries": [
            {
                "id": e.id,
                "name": e.name,
                "email": e.email,
                "subject": e.subject,
                "message": e.message,
                "status": e.status,
                "email_verified": e.email_verified,
                "admin_response": e.admin_response,
                "created_at": e.created_at,
                "responded_at": e.responded_at
            }
            for e in enquiries
        ]
    }


@router.patch("/admin/{enquiry_id}")
def update_enquiry(
    enquiry_id: int,
    data: EnquiryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin)
):
    enquiry = db.query(ContactEnquiry).filter(
        ContactEnquiry.id == enquiry_id
    ).first()

    if not enquiry:
        raise HTTPException(
            status_code=404,
            detail="Enquiry not found."
        )

    response_text = (
        data.admin_response.strip()
        if data.admin_response and data.admin_response.strip()
        else None
    )

    if data.status == "Responded" and not response_text:
        raise HTTPException(
            status_code=400,
            detail="Enter a response before marking as Responded."
        )

    enquiry.status = data.status
    enquiry.admin_response = response_text
    enquiry.responded_at = (
        datetime.utcnow() if data.status == "Responded" else None
    )

    try:
        db.commit()
        db.refresh(enquiry)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update enquiry."
        )

    return {
        "message": "Enquiry response saved successfully.",
        "email_sent": False,
        "id": enquiry.id,
        "status": enquiry.status,
        "admin_response": enquiry.admin_response
    }
