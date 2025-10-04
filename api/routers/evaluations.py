from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlmodel import Session, select
from typing import List

from api.database import get_session
from api.models.data_models import (
    Startup,
    Workstream,
    WorkstreamStartupEvaluation,
    WorkstreamStartupEvaluationUpdate,
)
from api.models.read_models import WorkstreamRead

router = APIRouter(tags=["evaluations"])


@router.post("/", response_model=WorkstreamStartupEvaluation)
def create_evaluation(
    evaluation: WorkstreamStartupEvaluation, session: Session = Depends(get_session)
):
    evaluation = WorkstreamStartupEvaluation.model_validate(evaluation)
    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    return evaluation


@router.post("/{workstream_id}", response_model=WorkstreamRead)
def create_evaluations_bulk(
    workstream_id: int,
    startup_ids: list[int],
    session: Session = Depends(get_session),
):
    db_workstream = session.get(Workstream, workstream_id)
    if not db_workstream:
        raise HTTPException(status_code=404, detail="Workstream not found")
    # Create evaluations for each startup
    for sid in startup_ids:
        startup = session.get(Startup, sid)
        if not startup:
            raise HTTPException(status_code=404, detail=f"Startup {sid} not found")
        evaluation = WorkstreamStartupEvaluation(
            workstream=db_workstream,
            startup=startup,
        )
        session.add(evaluation)
    session.add(evaluation)
    session.commit()
    session.refresh(db_workstream)
    return db_workstream


@router.get("/", response_model=List[WorkstreamStartupEvaluation])
def list_evaluations(
    workstream_id: int | None = None,
    startup_id: int | None = None,
    session: Session = Depends(get_session),
):
    query = select(WorkstreamStartupEvaluation)
    if workstream_id:
        query = query.where(WorkstreamStartupEvaluation.workstream_id == workstream_id)
    if startup_id:
        query = query.where(WorkstreamStartupEvaluation.startup_id == startup_id)
    return session.exec(query).all()


@router.put("/{workstream_id}/{startup_id}", response_model=WorkstreamStartupEvaluation)
def upsert_evaluations(
    workstream_id: int,
    startup_id: int,
    evaluation: WorkstreamStartupEvaluationUpdate,
    session: Session = Depends(get_session),
):
    try:
        WorkstreamStartupEvaluationUpdate.model_validate(evaluation)
    except ValidationError:
        raise HTTPException(
            status_code=422, detail="Evaluation update data format is invalid"
        )

    db_eval = session.get(WorkstreamStartupEvaluation, (workstream_id, startup_id))
    if not db_eval:
        db_startup = session.get(Startup, startup_id)
        if not db_startup:
            raise HTTPException(status_code=404, detail="Start-up not found")
        db_workstream = session.get(Workstream, workstream_id)
        if not db_workstream:
            raise HTTPException(status_code=404, detail="Workstream not found")
        db_eval = WorkstreamStartupEvaluation(
            workstream=db_workstream, startup=db_startup
        )

    update_data = evaluation.model_dump(exclude_unset=True)
    db_eval.sqlmodel_update(update_data)
    session.add(db_eval)
    session.commit()
    session.refresh(db_eval)
    return db_eval


@router.delete("/{workstream_id}", response_model=dict)
def delete_evaluations_bulk(
    workstream_id: int,
    startup_ids: list[int],
    session: Session = Depends(get_session),
):
    # Delete evaluations for each startup
    for sid in startup_ids:
        db_eval = session.get(WorkstreamStartupEvaluation, (workstream_id, sid))
        if not db_eval:
            raise HTTPException(status_code=404, detail=f"Startup {sid} not found")
        session.delete(db_eval)
    session.commit()
    return {"deleted": True}
