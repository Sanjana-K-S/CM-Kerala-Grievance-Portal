
from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, func


class ContactEnquiry(Base):
    __tablename__ = "contact_enquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    subject = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    email_verified = Column(Boolean, nullable=False, default=False)

    status = Column(String(30), nullable=False, default="Pending")
    admin_response = Column(Text, nullable=True)
    responded_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        server_default=func.current_timestamp(),
        nullable=False
    )
