
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.database import Base


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    reference_number = Column(String(30), nullable=False, unique=True)

    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    district = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    priority = Column(String(20), nullable=True, default="Medium")
    status = Column(String(30), nullable=True, default="Submitted")

    ai_department_suggestion = Column(String(150), nullable=True)
    ai_summary = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )
