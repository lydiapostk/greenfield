from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlmodel import Session, select
from typing import List

from api.database import get_session
from api.models import WorkstreamStartupEvaluation, WorkstreamStartupEvaluationUpdate

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.post("/", response_model=WorkstreamStartupEvaluation)
def create_evaluation(
    evaluation: WorkstreamStartupEvaluation, session: Session = Depends(get_session)
):
    evaluation = WorkstreamStartupEvaluation.model_validate(evaluation)
    session.add(evaluation)
    session.commit()
    session.refresh(evaluation)
    return evaluation


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
def update_evaluation(
    workstream_id: int,
    startup_id: int,
    evaluation: WorkstreamStartupEvaluationUpdate,
    session: Session = Depends(get_session),
):
    db_eval = session.get(WorkstreamStartupEvaluation, (workstream_id, startup_id))
    if not db_eval:
        raise HTTPException(status_code=404, detail="Evaluation not found")

    try:
        WorkstreamStartupEvaluationUpdate.model_validate(evaluation)
    except ValidationError:
        raise HTTPException(
            status_code=422, detail="Evaluation update data format is invalid"
        )

    update_data = evaluation.model_dump(exclude_unset=True)
    db_eval.sqlmodel_update(update_data)
    session.add(db_eval)
    session.commit()
    session.refresh(db_eval)
    return db_eval
