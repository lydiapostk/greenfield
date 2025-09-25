from typing import Optional, List, Dict
from sqlmodel import SQLModel, Field, Column, JSON
from sqlalchemy.dialects.postgresql import ENUM
from pgvector.sqlalchemy import Vector


class Startup(SQLModel, table=True):
    __tablename__ = "startups"

    id: Optional[int] = Field(default=None, primary_key=True)
    company_name: str
    company_website: Optional[str] = None
    year_founded: Optional[str] = (None,)
    country: Optional[str] = (None,)
    num_employees: Optional[str] = Field(
        default=None,
        sa_column=Column(
            ENUM(
                "1-5",
                "5-10",
                "10-20",
                "20-100",
                "100-200",
                "200-500",
                "500-1000",
                ">1000",
                name="num_employees",
                create_type=False,
            )
        ),
    )

    founders: Optional[Dict[str, Optional[str]]] = Field(
        default=None, sa_column=Column(JSON)
    )
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

    trl: Optional[str] = None
    trl_explanation: Optional[str] = None
