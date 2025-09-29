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


# Define a Pydantic model for the JSON field
class Founders(RootModel[dict[str, Optional[HttpUrl]]]):
    def model_dump(self, *args, **kwargs):
        # return the inner dict instead of {"root": {...}}
        return self.root

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        # Fixes OpenAPI schema so it shows as an object, not {"root": {...}}
        schema = handler(core_schema)  # noqa: F841
        return {"type": "object", "additionalProperties": {"type": "string"}}


class StartupBase(SQLModel):
    id: int = Field(primary_key=True)
    company_name: str
    company_website: Optional[str] = Field(default=None, unique=True)
    year_founded: Optional[str] = None
    country: Optional[str] = None
    num_employees: Optional[str] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                "1-10",
                "11-50",
                "51-100",
                "101-1000",
                ">1000",
                name="num_employees",
                create_type=False,
            )
        ),
    )

    # Store plain dict in DB
    founders: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    investors: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))

    funding_stage: Optional[str] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                "Conceptual",
                "Pre-seed",
                "Seed",
                "Series A",
                "Series B",
                "Series C",
                "Series D",
                name="funding_stage",
                create_type=False,
            )
        ),
    )

    funds_raised: Optional[str] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                "<$500K",
                "$500K-$1M",
                "$1M-$5M",
                "$5M-$10M",
                ">$10M",
                name="funds_raised",
                create_type=False,
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

    trl: Optional[str] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                "TRL 1-4",
                "TRL 5-7",
                "TRL 8-9",
                name="trl",
                create_type=False,
            )
        ),
    )
    trl_explanation: Optional[str] = None

    # ---------- Pydantic-facing wrapper ----------
    @computed_field  # shows up in FastAPI schema
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


class Startup(StartupBase, table=True):
    __tablename__ = "startups"
    id: Optional[int] = Field(default=None, primary_key=True)


class StartupUpdate(StartupBase):
    company_name: Optional[str] = None
