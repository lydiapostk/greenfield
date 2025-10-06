import json
import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query
from openai import OpenAI
from pydantic import BaseModel, ValidationError
from sqlalchemy import func
from sqlmodel import Session, select

from api.database import get_session
from api.models.data_models import (
    Startup,
    WorkstreamStartupEvaluation,
)
from api.models.read_models import StartupReadLite, WorkstreamRead

load_dotenv()

TEMP_EXPANSION = {
    "use_case": "Accurate crowd counting is critical for ensuring public safety during large-scale events in Singapore such as National Day celebrations, concerts, or sports gatherings. Reliable real-time estimates of crowd size help agencies allocate resources effectively, manage entry and evacuation routes, and prevent overcrowding or panic situations. In dense urban settings with high foot traffic, timely and precise crowd estimation supports proactive incident management and enhances operational readiness for the Home Team.",
    "challenge": "Existing crowd counting technologies like CCTV-based analytics, Wi-Fi or Bluetooth signal triangulation, and drone-based imaging struggle to deliver consistent accuracy at scale. Video analytics systems face challenges with occlusion and lighting variations, while signal-based methods can double-count or miss individuals due to device variability. Drone imaging is resource-intensive and limited by airspace and privacy constraints. These solutions also face scalability, cost, and data protection hurdles, limiting their reliability for continuous nationwide deployment.",
    "technologies": [
        "Edge-based computer vision and AI models optimized for dense crowds",
        "Multi-sensor data fusion (video, thermal, and signal-based inputs)",
        "Federated learning for privacy-preserving model improvement",
        "Real-time crowd density heatmaps via 5G-enabled IoT infrastructure",
        "Autonomous aerial and ground robotics for adaptive monitoring",
    ],
}

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",  # 1536 dims
        input=text,
    )
    return response.data[0].embedding


class SuggestWorkstreamResponse(BaseModel):
    use_case: Optional[str] = None
    challenge: Optional[str] = None
    technologies: Optional[List[str]] = None
    overall_recommendation: Optional[str] = None


@router.get("/suggest/from_use_case", response_model=SuggestWorkstreamResponse)
def suggest_from_use_case(use_case: str = Query(...)):
    with open("api/suggest_from_use_case.txt", "r", encoding="utf-8") as f:
        instruction = f.read()
    input = f"{instruction} {use_case}"  # noqa: F841
    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort": "low"},
        instructions=instruction,
        input=input,
        store=True,
        tools=[{"type": "web_search"}],
        stream=False,
    )
    suggestion = json.loads(response.output_text)
    # suggestion = TEMP_EXPANSION  # TODO: remove placeholder
    parsed_suggestion = None
    while not parsed_suggestion:
        if len(suggestion) == 0:
            raise HTTPException(
                status_code=500, detail="Unable to fetch a valid suggestion from LLM."
            )
        try:
            parsed_suggestion = SuggestWorkstreamResponse.model_validate(suggestion)
        except ValidationError as e:
            e_locs = [err["loc"] for err in e.errors()]
            for keys_to_delete in e_locs:
                if (len(keys_to_delete)) == 1:
                    suggestion.pop(keys_to_delete[0])
                else:
                    target_dict = suggestion
                    for key_to_delete in keys_to_delete[:-1]:
                        target_dict = target_dict[key_to_delete]
                    target_dict.pop(keys_to_delete[-1])
    return parsed_suggestion


@router.post(
    "/suggest/startups/from_technologies", response_model=list[StartupReadLite]
)
def suggest_startups_from_technologies(
    workstream_id: int,
    technologies: list[str],
    session: Session = Depends(get_session),
    limit: int = 5,
):
    # Generate embeddings for each input technology
    query_vecs = [embed_text(t) for t in technologies]

    # Build a similarity expression: least distance across all query vectors
    order_expr = func.least(
        *[Startup.tech_embedding.op("<=>")(qv) for qv in query_vecs]
    )

    # Subquery of startups already linked to this workstream
    evaluated_startups = select(WorkstreamStartupEvaluation.startup_id).where(
        WorkstreamStartupEvaluation.workstream_id == workstream_id
    )

    # Main query: exclude already-evaluated startups
    statement = (
        select(Startup)
        .where(Startup.id.not_in(evaluated_startups))
        .order_by(order_expr)
        .limit(limit)
    )

    # Execute and return
    results = session.exec(statement).all()
    return results


class SuggestStartupEvaluationResponse(BaseModel):
    competitive_advantage: Optional[str] = None
    risks: Optional[str] = None
    collaboration_potential: Optional[str] = None


@router.post(
    "/suggest/startup_eval/from_workstream",
    response_model=SuggestStartupEvaluationResponse,
)
def suggest_startup_eval_from_workstream(
    workstream: WorkstreamRead,
    company_name: str = Query(...),
):
    with open("api/startup_evaluation.txt", "r", encoding="utf-8") as f:
        instruction = f.read()
    input = f"{instruction}\nWorkstream:{workstream}\nStart-up:{company_name}"
    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort": "low"},
        instructions=instruction,
        input=input,
        store=True,
        tools=[{"type": "web_search"}],
        stream=False,
    )
    suggestion = json.loads(response.output_text)
    parsed_suggestion = None
    while not parsed_suggestion:
        if len(suggestion) == 0:
            raise HTTPException(
                status_code=500, detail="Unable to fetch a valid suggestion from LLM."
            )
        try:
            parsed_suggestion = SuggestStartupEvaluationResponse.model_validate(
                suggestion
            )
        except ValidationError as e:
            e_locs = [err["loc"] for err in e.errors()]
            for keys_to_delete in e_locs:
                if (len(keys_to_delete)) == 1:
                    suggestion.pop(keys_to_delete[0])
                else:
                    target_dict = suggestion
                    for key_to_delete in keys_to_delete[:-1]:
                        target_dict = target_dict[key_to_delete]
                    target_dict.pop(keys_to_delete[-1])
    return parsed_suggestion
