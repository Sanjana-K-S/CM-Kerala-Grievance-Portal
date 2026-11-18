
from pydantic import BaseModel, Field
from typing import Literal


class GrievanceCreate(BaseModel):
    district: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=100)
    subject: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=10)

    priority: Literal["Low", "Medium", "High"] = "Medium"
