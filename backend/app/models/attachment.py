
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(
        Integer,
        ForeignKey("grievances.id"),
        nullable=False
    )
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    uploaded_at = Column(
        DateTime,
        server_default=func.current_timestamp(),
        nullable=False
    )
