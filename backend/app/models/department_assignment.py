from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from app.database import Base


class DepartmentAssignment(Base):
    __tablename__ = "department_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    grievance_id = Column(
        Integer,
        ForeignKey("grievances.id"),
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False
    )

    officer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    assigned_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    assigned_at = Column(
        DateTime,
        nullable=False,
        server_default=func.current_timestamp()
    )