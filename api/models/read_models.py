from datetime import date
from typing import List, Optional
from sqlmodel import Column, Field, SQLModel

from api.models.data_models import (
    Founders,
    FoundersType,
    StartupBase,
    WorkstreamBase,
    WorkstreamStartupEvaluationBase,
)


########################################
# Workstream with minimal startup info #
########################################
class StartupLite(SQLModel):
    id: int
    company_name: str
    country: Optional[str] = None
    company_website: Optional[str]
    founders: Optional[Founders] = Field(default=None, sa_column=Column(FoundersType))


class EvaluationReadWithStartupLite(WorkstreamStartupEvaluationBase):
    startup: StartupLite


class WorkstreamReadLite(WorkstreamBase):
    id: int
    create_date: date
    evaluations: List[EvaluationReadWithStartupLite] = []


# Workstream upsert should be with startup lite
class WorkstreamUpsert(WorkstreamBase):
    startup_ids: List[int] = Field(default_factory=list)


########################################
# Startup with minimal workstream info #
########################################
class WorkstreamLite(SQLModel):
    id: int
    create_date: date
    title: Optional[str]


class EvaluationReadWithWorkstreamLite(WorkstreamStartupEvaluationBase):
    workstream: WorkstreamLite


# Start-up with evaluations
class StartupReadLite(StartupBase):
    id: int
    evaluations: List[EvaluationReadWithWorkstreamLite] = []


#####################################
# Workstream with full startup info #
#####################################
class EvaluationReadWithStartup(WorkstreamStartupEvaluationBase):
    startup: StartupReadLite


class WorkstreamRead(WorkstreamBase):
    id: int
    create_date: date
    evaluations: List[EvaluationReadWithStartup] = []


#####################################
# Startup with full workstream info #
#####################################
class EvaluationReadWithWorkstream(WorkstreamStartupEvaluationBase):
    workstream: WorkstreamReadLite


class StartupRead(StartupBase):
    id: int
    evaluations: List[EvaluationReadWithWorkstream] = []
