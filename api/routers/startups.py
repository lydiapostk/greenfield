from dotenv import load_dotenv
from fastapi import APIRouter, Query
from fastapi import Depends
from openai import OpenAI
import os
from sqlmodel import Session, select
from api.database import get_session
from api.models import Startup, StartupUpdate

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


@router.get("/", response_model=list[Startup])
def list_startups(session: Session = Depends(get_session)):
    return session.exec(select(Startup).order_by(Startup.company_name)).all()


@router.get("/fetch/by_id", response_model=Startup | None)
def get_startup_by_id(id: str = Query(...), session: Session = Depends(get_session)):
    startup = session.get(Startup, id)
    return startup


@router.get("/fetch/by_website", response_model=Startup | None)
def get_startup_by_website(
    lookup_url: str = Query(...), session: Session = Depends(get_session)
):
    startup = session.exec(
        select(Startup).where(Startup.company_website == lookup_url)
    ).one_or_none()
    return startup


@router.post("/update/by_id", response_model=Startup | None)
def update_startup_by_id(
    startup_update: StartupUpdate, session: Session = Depends(get_session)
):
    startup = session.get(Startup, startup_update.id)
    if not startup:
        return None
    update_data = startup_update.model_dump(exclude_unset=True)
    startup.sqlmodel_update(update_data)
    session.add(startup)
    session.commit()
    startup = session.get(Startup, startup.id)
    return startup
