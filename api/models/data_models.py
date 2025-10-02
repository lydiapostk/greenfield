from datetime import date
from typing import Any, Optional, List, Dict
from pydantic import HttpUrl, RootModel, BaseModel, field_validator
from sqlmodel import Relationship, SQLModel, Field, Column, JSON, TypeDecorator
from sqlalchemy.dialects.postgresql import ENUM
from pgvector.sqlalchemy import Vector
import enum


# -------------------- Enums --------------------
class NumEmployeesEnum(str, enum.Enum):
    one_to_ten = "1-10"
    eleven_to_fifty = "11-50"
    fifty_one_to_hundred = "51-100"
    hundred_one_to_thousand = "101-1000"
    over_thousand = ">1000"


class FundingStageEnum(str, enum.Enum):
    conceptual = "Conceptual"
    pre_seed = "Pre-seed"
    seed = "Seed"
    series_a = "Series A"
    series_b = "Series B"
    series_c = "Series C"
    series_d = "Series D"


class FundsRaisedEnum(str, enum.Enum):
    under_500k = "<$500K"
    between_500k_1m = "$500K-$1M"
    between_1m_5m = "$1M-$5M"
    between_5m_10m = "$5M-$10M"
    over_10m = ">$10M"


class TrlEnum(str, enum.Enum):
    trl_1_4 = "TRL 1-4"
    trl_5_7 = "TRL 5-7"
    trl_8_9 = "TRL 8-9"


# -------------------- JSON Models --------------------
class Founders(RootModel[dict[str, Optional[HttpUrl]]]):
    """Map of founder name -> website URL"""

    @field_validator("root", mode="before")
    @classmethod
    def coerce_empty_url(cls, v):
        if isinstance(v, dict):
            return {k: (None if v_ == "" else v_) for k, v_ in v.items()}
        return v

    # No override: FastAPI generates correct schema automatically
    pass


class FoundersType(TypeDecorator):
    impl = JSON

    def process_bind_param(self, value: Any, dialect):
        """Prepare Python → DB"""
        if value is None:
            return None

        if isinstance(value, dict):
            # Convert HttpUrl → str
            return {
                k: (str(v) if isinstance(v, HttpUrl) else v) for k, v in value.items()
            }

        if hasattr(value, "model_dump"):
            # Pydantic Founders model
            return value.model_dump(mode="json")

        return value  # already JSON-safe

    def process_result_value(self, value: Any, dialect):
        """Prepare DB → Python"""
        if value is None:
            return None
        from .data_models import Founders  # lazy import to avoid circular refs

        return Founders.model_validate(value)


class CompetitorInfo(BaseModel):
    description: str
    url: HttpUrl

    @field_validator("url", mode="before")
    @classmethod
    def coerce_empty_url(cls, v):
        if v == "":
            return None
        return v


class Competitors(RootModel[List[Dict[str, CompetitorInfo]]]):
    """List of {competitor name: {description, url}} objects"""

    pass


class CompetitorsType(TypeDecorator):
    impl = JSON

    def process_bind_param(self, value: Any, dialect):
        """Prepare Python → DB"""
        if value is None:
            return None

        def _to_json_safe(obj):
            if isinstance(obj, HttpUrl):
                return str(obj)
            elif hasattr(obj, "model_dump"):
                return obj.model_dump(mode="json")
            elif isinstance(obj, dict):
                return {k: _to_json_safe(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [_to_json_safe(v) for v in obj]
            return obj

        return _to_json_safe(value)

    def process_result_value(self, value: Any, dialect):
        """Prepare DB → Python"""
        if value is None:
            return None

        return Competitors.model_validate(value)


# -------------------- Base SQLModel --------------------
class StartupBase(SQLModel):
    company_name: str
    company_website: Optional[str] = Field(default=None, unique=True)
    year_founded: Optional[str] = None
    country: Optional[str] = None

    num_employees: Optional[NumEmployeesEnum] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                NumEmployeesEnum,
                name="num_employees",
                create_type=False,
                values_callable=lambda obj: [e.value for e in obj],
            )
        ),
    )

    founders: Optional[Founders] = Field(default=None, sa_column=Column(FoundersType))
    investors: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    funding_stage: Optional[FundingStageEnum] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                FundingStageEnum,
                name="funding_stage",
                create_type=False,
                values_callable=lambda obj: [e.value for e in obj],
            )
        ),
    )

    funds_raised: Optional[FundsRaisedEnum] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                FundsRaisedEnum,
                name="funds_raised",
                create_type=False,
                values_callable=lambda obj: [e.value for e in obj],
            )
        ),
    )

    ref_funding: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    tech_offering: Optional[str] = None
    ref_tech: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    tech_embedding: Optional[List[float]] = Field(
        default=None, sa_column=Column(Vector(1536))
    )

    uvp: Optional[str] = None
    ref_uvp: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    uvp_embedding: Optional[List[float]] = Field(
        default=None, sa_column=Column(Vector(1536))
    )

    trl: Optional[TrlEnum] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                TrlEnum,
                name="trl",
                create_type=False,
                values_callable=lambda obj: [e.value for e in obj],
            )
        ),
    )
    trl_explanation: Optional[str] = None

    competitors: Optional[Competitors] = Field(
        default=None, sa_column=Column(CompetitorsType)
    )
    use_cases: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    # ✅ Ensure enums serialize as values (not enum names) in API responses
    model_config = {"use_enum_values": True}


# -------------------- Table + Update --------------------
class Startup(StartupBase, table=True):
    __tablename__ = "startups"
    id: Optional[int] = Field(default=None, primary_key=True)
    evaluations: List["WorkstreamStartupEvaluation"] = Relationship(
        back_populates="startup",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class StartupUpdate(StartupBase):
    company_name: Optional[str] = None


class WorkstreamBase(SQLModel):
    title: str = Field(default="Untitled")
    use_case: Optional[str] = None
    challenge: Optional[str] = None
    analyst: Optional[str] = None
    overall_recommendation: Optional[str] = None


class WorkstreamUpsert(WorkstreamBase):
    pass


class Workstream(WorkstreamBase, table=True):
    __tablename__ = "workstreams"

    id: Optional[int] = Field(default=None, primary_key=True)
    create_date: date = Field(
        default=None,
        nullable=False,
        sa_column_kwargs={
            "server_default": "(CURRENT_DATE AT TIME ZONE 'Asia/Singapore')"
        },
    )
    evaluations: List["WorkstreamStartupEvaluation"] = Relationship(
        back_populates="workstream",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class WorkstreamStartupEvaluationBase(SQLModel):
    competitive_advantage: Optional[str] = None
    risks: Optional[str] = None
    collaboration_potential: Optional[str] = None


class WorkstreamStartupEvaluationUpdate(WorkstreamStartupEvaluationBase):
    pass


class WorkstreamStartupEvaluation(WorkstreamStartupEvaluationBase, table=True):
    __tablename__ = "workstream_startup_evaluations"

    workstream_id: int = Field(foreign_key="workstreams.id", primary_key=True)
    startup_id: int = Field(foreign_key="startups.id", primary_key=True)
    workstream: Workstream = Relationship(back_populates="evaluations")
    startup: Startup = Relationship(back_populates="evaluations")
