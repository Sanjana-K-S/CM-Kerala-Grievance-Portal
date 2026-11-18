
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    mobile = Column(String(15))
    password_hash = Column(String(255), nullable=False)

    role = Column(
        Enum("citizen", "cmo_admin", "officer"),
        nullable=False,
        default="citizen"
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    created_at = Column(DateTime, server_default=func.now())
