from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from fastapi import Depends
from openai import OpenAI
import os
from sqlmodel import Session, select
from api.database import get_session
from api.models.data_models import Startup, StartupUpsert
from api.models.read_models import StartupReadLite

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)


@router.get("/", response_model=list[StartupReadLite])
def list_startups(session: Session = Depends(get_session)):
    return session.exec(select(Startup).order_by(Startup.company_name)).all()


@router.get("/by_id/{startup_id}", response_model=StartupReadLite)
def get_startup_by_id(startup_id: int, session: Session = Depends(get_session)):
    db_startup = session.get(Startup, startup_id)
    if not db_startup:
        raise HTTPException(status_code=404, detail="Start-up not found")
    return db_startup


@router.get("/by_website", response_model=StartupReadLite | None)
def get_startup_by_website(
    lookup_url: str = Query(...), session: Session = Depends(get_session)
):
    maybe_startup = session.exec(
        select(Startup).where(Startup.company_website == lookup_url)
    ).one_or_none()
    return maybe_startup


@router.put("/{startup_id}", response_model=StartupReadLite)
def update_startup_by_id(
    startup_id: int,
    startup_update: StartupUpsert,
    session: Session = Depends(get_session),
):
    db_startup = session.get(Startup, startup_id)
    if not db_startup:
        raise HTTPException(status_code=404, detail="Start-up not found")
    update_data = startup_update.model_dump(exclude_unset=True)
    # Generate embeddings
    if startup_update.tech_offering:
        update_data["tech_embedding"] = (
            client.embeddings.create(
                model="text-embedding-3-small", input=startup_update.tech_offering
            )
            .data[0]
            .embedding
        )
    db_startup.sqlmodel_update(update_data)
    session.add(db_startup)
    session.commit()
    session.refresh(db_startup)
    return db_startup


@router.delete("/", response_model=dict)
def delete_item(ids: list[int], session: Session = Depends(get_session)):
    for id in ids:
        db_startup = session.get(Startup, id)
        if not db_startup:
            raise HTTPException(
                status_code=404, detail="Start-up not found"
            )  # Cancel delete if anything is missing
        session.delete(db_startup)
    session.commit()
    return {"deleted": True}
