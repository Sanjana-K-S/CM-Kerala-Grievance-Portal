
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database import Base


class ContactEmailOTP(Base):
    __tablename__ = "contact_email_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), nullable=False)
    otp_hash = Column(String(255), nullable=False)
    name = Column(String(150), nullable=False)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(
        DateTime,
        server_default=func.current_timestamp()
    )
