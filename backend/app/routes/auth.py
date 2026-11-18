
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    try:
        next_user_id = (db.query(func.max(User.id)).scalar() or 0) + 1

        user = User(
            id=next_user_id,
            name=data.name,
            email=data.email,
            mobile=data.mobile,
            password_hash=hash_password(data.password),
            role="citizen"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "Registration successful",
            "user_id": user.id,
            "name": user.name,
            "email": user.email
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again."
        )


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user or not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }
