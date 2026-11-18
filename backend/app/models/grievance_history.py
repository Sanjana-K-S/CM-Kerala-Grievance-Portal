from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from app.database import Base


class GrievanceHistory(Base):
    __tablename__ = "grievance_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    grievance_id = Column(
        Integer,
        ForeignKey("grievances.id"),
        nullable=False
    )

    changed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )