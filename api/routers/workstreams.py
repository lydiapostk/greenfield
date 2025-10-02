from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from api.database import get_session
from api.models.data_models import Workstream, WorkstreamUpsert
from api.models.read_models import WorkstreamRead, WorkstreamReadLite

router = APIRouter(tags=["workstreams"])


@router.post("/", response_model=WorkstreamReadLite)
def create_workstream(
    workstream_create: WorkstreamUpsert, session: Session = Depends(get_session)
):
    workstream = Workstream(**workstream_create.model_dump())
    session.add(workstream)
    session.commit()
    session.refresh(workstream)
    return workstream


@router.get("/", response_model=List[WorkstreamReadLite])
def list_workstreams(session: Session = Depends(get_session)):
    return session.exec(select(Workstream)).all()


@router.get("/{workstream_id}", response_model=List[WorkstreamRead])
def get_workstream(workstream_id: int, session: Session = Depends(get_session)):
    db_ws = session.get(Workstream, workstream_id)
    if not db_ws:
        raise HTTPException(status_code=404, detail="Workstream not found")
    return db_ws


@router.put("/{workstream_id}", response_model=WorkstreamRead)
def update_workstream(
    workstream_id: int, ws: WorkstreamUpsert, session: Session = Depends(get_session)
):
    db_ws = session.get(Workstream, workstream_id)
    if not db_ws:
        raise HTTPException(status_code=404, detail="Workstream not found")

    update_data = ws.model_dump(exclude_unset=True)
    db_ws.sqlmodel_update(update_data)
    session.add(db_ws)
    session.commit()
    session.refresh(db_ws)
    return db_ws
