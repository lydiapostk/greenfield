from dotenv import load_dotenv
from fastapi import APIRouter, Query
from fastapi import Depends
from openai import OpenAI
import os
from sqlmodel import Session, select
from api.database import get_session
from api.models import Startup

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


@router.get("/", response_model=list[Startup])
def list_startups(session: Session = Depends(get_session)):
    return session.exec(select(Startup).order_by(Startup.company_name)).all()


@router.get("/fetch/by_website", response_model=Startup | None)
def get_startup_by_website(
    lookup_url: str = Query(...), session: Session = Depends(get_session)
):
    startup = session.exec(
        select(Startup).where(Startup.company_website == lookup_url)
    ).one_or_none()
    return startup
