from typing import Optional, List
from pydantic import (
    HttpUrl,
    RootModel,
    field_serializer,
    field_validator,
    computed_field,
)
from sqlmodel import SQLModel, Field, Column, JSON
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


# -------------------- JSON Wrapper --------------------
class Founders(RootModel[dict[str, Optional[HttpUrl]]]):
    def model_dump(self, *args, **kwargs):
        # return the inner dict instead of {"root": {...}}
        return self.root

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        # Fixes OpenAPI schema so it shows as an object, not {"root": {...}}
        schema = handler(core_schema)  # noqa: F841
        return {"type": "object", "additionalProperties": {"type": "string"}}


# -------------------- Base Model --------------------
class StartupBase(SQLModel):
    id: int = Field(primary_key=True)
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
                values_callable=lambda obj: [
                    e.value for e in obj
                ],  # use values not names
            )
        ),
    )
    founders: Optional[dict] = Field(default=None, sa_column=Column(JSON))
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

    # ---------- Pydantic-facing wrapper ----------
    @computed_field
    @property
    def founders_obj(self) -> Optional[Founders]:
        if self.founders is None:
            return None
        return Founders(self.founders)

    @field_validator("founders", mode="before")
    def coerce_founders_before(cls, v):
        if isinstance(v, Founders):
            return v.root
        return v

    @field_serializer("founders_obj")
    def serialize_founders_obj(self, v: Optional[Founders], _info):
        if v is None:
            return None
        return v.root

    # Ensure enums serialize as values in API responses
    model_config = {"use_enum_values": True}


class Startup(StartupBase, table=True):
    __tablename__ = "startups"
    id: Optional[int] = Field(default=None, primary_key=True)


class StartupUpdate(StartupBase):
    company_name: Optional[str] = None
