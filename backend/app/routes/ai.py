
import os
import json

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from google import genai

from app.utils.dependencies import get_current_user

load_dotenv()

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Grievance Assistant"]
)


class ComplaintAnalysisRequest(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)


@router.post("/analyze")
def analyze_complaint(
    request: ComplaintAnalysisRequest,
    current_user=Depends(get_current_user)
):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Check backend .env."
        )

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
Analyse this citizen grievance.

Subject: {request.subject}
Description: {request.description}

Select one department:
Public Works, Health, Education, Local Self Government,
Water Resources, Transport, Electricity.

Select one category:
Road Maintenance, Water Supply, Electricity, Healthcare,
Education, Sanitation, Public Services, Other.

Select priority: Low, Medium, or High.

Generate a short factual summary for the CMO.

Return only JSON:
{{
  "department": "department name",
  "category": "category name",
  "priority": "Low/Medium/High",
  "summary": "short summary"
}}

Do not invent facts. These are suggestions, not official decisions.
"""

        interaction = client.interactions.create(
            model="gemini-3.5-flash-lite",
            input=prompt
        )

        result = json.loads(interaction.output_text)

        allowed_departments = [
            "Public Works",
            "Health",
            "Education",
            "Local Self Government",
            "Water Resources",
            "Transport",
            "Electricity"
        ]

        allowed_categories = [
            "Road Maintenance",
            "Water Supply",
            "Electricity",
            "Healthcare",
            "Education",
            "Sanitation",
            "Public Services",
            "Other"
        ]

        if result.get("department") not in allowed_departments:
            result["department"] = "Local Self Government"

        if result.get("category") not in allowed_categories:
            result["category"] = "Other"

        if result.get("priority") not in ["Low", "Medium", "High"]:
            result["priority"] = "Medium"

        if not result.get("summary"):
            result["summary"] = "AI summary unavailable."

        return {
            "success": True,
            "suggestions": result,
            "notice": "AI suggestions only. Please review before submitting."
        }

    except Exception as error:
        print("AI analysis error:", str(error))
        raise HTTPException(
            status_code=502,
            detail="AI analysis failed. Please try again."
        )
