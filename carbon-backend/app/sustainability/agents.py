import os
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext
from sqlalchemy.orm import Session

from app.sustainability.schemas import CarbonAnalysisResponse
from app.database.models import Profile
from app.core.config import settings

os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY.get_secret_value()


# 1. Dependency Injection Contract
# This dataclass ensures the AI always knows exactly who it is talking to
# and has secure access to the Postgres database for that specific request.
@dataclass
class CarbonAgentDeps:
    db: Session
    current_user: Profile


# 2. The Supervisor Agent
# We bind the agent to OpenAI, give it the dependencies, and force it to
# return ONLY the CarbonAnalysisResponse schema we built earlier.
lead_carbon_coach = Agent(
    "openai-chat:gpt-4o-mini",
    deps_type=CarbonAgentDeps,
    output_type=CarbonAnalysisResponse,
    system_prompt=(
        "You are an elite Carbon Footprint Analyst. "
        "Your job is to analyze the user's lifestyle habits, categorize them, "
        "and calculate their exact CO2 footprint. "
        "CRITICAL RULES: "
        "1. Do not hallucinate math. Always use your tools to look up emission factors. "
        "2. Be empathetic but scientific in your summary. "
        "3. Ensure your category_breakdown maps strictly to 'transport', 'diet', 'energy', or 'waste'."
    ),
)


# 3. The Worker Tools
# The agent will autonomously decide when to call this Python function
# to retrieve grounded data before it calculates the final response.
@lead_carbon_coach.tool
def get_emission_factor(ctx: RunContext[CarbonAgentDeps], activity_query: str) -> str:
    """
    Retrieves the standard emission factor multiplier for a specific activity.
    Call this tool whenever the user mentions driving, flying, eating, or energy use.
    """

    # NOTE: In our next database phase, we will replace this dictionary with
    # a pgvector semantic search against our emission_factors table.
    # For now, we use a rigid structural mock to prove the AI tool-calling works.
    mock_database = {
        "driving": "0.41 kg CO2e per mile",
        "flight": "0.25 kg CO2e per mile",
        "beef": "27.0 kg CO2e per kg of meat",
        "electricity": "0.38 kg CO2e per kWh",
    }

    for key, multiplier in mock_database.items():
        if key in activity_query.lower():
            return f"MATCH FOUND: For '{key}', the multiplier is {multiplier}."

    return "Factor not found. Estimate safely based on general global averages and note it in the summary."
