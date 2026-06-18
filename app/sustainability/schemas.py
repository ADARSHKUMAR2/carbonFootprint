from typing import Dict, List
from pydantic import BaseModel, Field


class CarbonAnalysisResponse(BaseModel):
    """
    The absolute contract that the AI must fulfill.
    The AI is forced to return a JSON object matching this exact structure.
    """

    total_co2_kg: float = Field(
        description="Total calculated CO2 equivalent for the context window in kilograms."
    )

    category_breakdown: Dict[str, float] = Field(
        description="Breakdown of CO2e across main categories: 'transport', 'diet', 'energy', 'waste'. Keys must be lowercase."
    )

    largest_emission_source: str = Field(
        description="The dominant category driving the current footprint metrics (e.g., 'transport')."
    )

    summary_message: str = Field(
        description="An empathetic yet clear conversational explanation of the habits evaluated, written in the second person ('You')."
    )

    personalized_action_plan: List[str] = Field(
        description="Exactly 3 actionable, data-backed steps to lower the footprint.",
        min_length=3,
        max_length=3,
    )
