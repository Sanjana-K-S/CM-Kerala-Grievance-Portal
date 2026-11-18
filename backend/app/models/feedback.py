
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from app.database import Base


class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    grievance_id = Column(
        Integer, ForeignKey("grievances.id"), nullable=False, index=True
    )
    citizen_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    rating = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
