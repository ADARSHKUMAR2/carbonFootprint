from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import asyncio
from app.api.deps import get_current_user, get_db
from app.database.models import Profile
import json

# Import the new PydanticAI Agent and its Dependencies
from app.sustainability.agents import lead_carbon_coach, CarbonAgentDeps

router = APIRouter()


# 1. Matches the objects inside the 'parts' list
class ContentPart(BaseModel):
    type: str
    text: str


# 2. Update to match the 'parts' field identified in the error
class Message(BaseModel):
    role: str
    parts: List[ContentPart]  # Changed from 'content' to 'parts'


# 3. Update the request model
class ChatRequest(BaseModel):
    messages: List[Message]
    thread_id: Optional[str] = None


@router.post("/carbon/stream", summary="Stream AI Carbon Coaching")
async def chat_stream(
    request: ChatRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Flatten the messages
    formatted_messages = []
    for msg in request.messages:
        content_text = "".join([part.text for part in msg.parts if part.type == "text"])
        formatted_messages.append({"role": msg.role, "content": content_text})

    async def response_generator():
        deps = CarbonAgentDeps(db=db, current_user=current_user)

        try:
            # We use .run() to get the complete structured response
            result = await lead_carbon_coach.run(
                formatted_messages[-1]["content"],
                deps=deps,
                message_history=formatted_messages[:-1],
            )

            # Use the structured data directly
            # .output is your CarbonAnalysisResponse Pydantic model
            yield result.output.model_dump_json()

        except Exception as e:
            print(f"🚨 Agent Error: {str(e)}")
            yield json.dumps({"error": str(e)})

    return StreamingResponse(response_generator(), media_type="application/json")
