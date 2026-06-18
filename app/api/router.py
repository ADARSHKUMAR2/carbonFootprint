import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.database.models import Profile

# Import the new PydanticAI Agent and its Dependencies
from app.sustainability.agents import lead_carbon_coach, CarbonAgentDeps

router = APIRouter()


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    thread_id: Optional[str] = None


@router.post("/carbon/stream", summary="Stream AI Carbon Coaching")
async def chat_stream(
    request: ChatRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # Extract the user's latest message
    user_message = request.messages[-1]["content"]

    # Initialize the strict dependencies for the AI
    deps = CarbonAgentDeps(db=db, current_user=current_user)

    async def response_generator():
        # Execute the PydanticAI agent. We use run_stream to get the data chunk-by-chunk.
        # It will automatically invoke the tools and format the output to our Schema.
        async with lead_carbon_coach.run_stream(user_message, deps=deps) as result:
            # We stream the validated JSON structure exactly as Vercel AI SDK expects
            async for json_chunk in result.stream_text():
                # '0:' is the Vercel AI SDK prefix for standard text chunks
                yield f"0:{json.dumps(json_chunk)}\n"

    return StreamingResponse(response_generator(), media_type="text/plain")
