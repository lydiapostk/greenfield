from dotenv import load_dotenv
from fastapi import APIRouter, Query
import json
from fastapi import Depends
from openai import OpenAI
import os
from sqlmodel import Session
from api.database import get_session
from api.models import Startup

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


@router.get("/lookup", response_model=Startup)
def lookup_startup(
    startup_url: str = Query(...), session: Session = Depends(get_session)
):
    with open("api/instruction.txt", "r", encoding="utf-8") as f:
        instruction = f.read()
    with open("api/input_template.txt", "r", encoding="utf-8") as f:
        input_template = f.read()
    input = f"{', '.join(startup_url)}: {input_template}"
    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort": "low"},
        instructions=instruction,
        input=input,
        store=True,
        tools=[{"type": "web_search"}],
        stream=False,
    )
    startup_info = json.loads(response.output_text)
    startup = Startup.model_validate(startup_info)
    startup.company_website = startup_url
    session.add(startup)
    session.commit()
    session.refresh(startup)
    if not startup:
        return {"error": "Startup not found"}
    return startup
