import json
import psycopg2
from dotenv import load_dotenv
import os

# import your models
from api.models import data_models  # adjust import path

# load .env
load_dotenv()

conn = psycopg2.connect(
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432"),
)
cur = conn.cursor()

with open("db\startups.json", "r", encoding="utf-8") as f:
    startups = json.load(f)

for s in startups:
    # ✅ Validate founders + competitors before inserting
    founders = None
    if s.get("founders"):
        founders = data_models.Founders.model_validate(s["founders"]).model_dump()

    competitors = None
    if s.get("competitors"):
        print(s["competitors"])
        competitors = data_models.Competitors.model_validate(
            s["competitors"]
        ).model_dump()

    cur.execute(
        """
        INSERT INTO startups (
            company_name, company_website, year_founded, country, num_employees,
            founders, competitors, funding_stage, funds_raised,
            ref_funding, investors, tech_offering, ref_tech,
            uvp, ref_uvp, trl, trl_explanation, use_cases
        ) VALUES (%s, %s, %s, %s, %s,
                  %s, %s, %s, %s,
                  %s, %s, %s, %s,
                  %s, %s, %s, %s, %s)
        """,
        (
            s.get("company_name"),
            s.get("company_website"),
            s.get("year_founded"),
            s.get("country"),
            s.get("num_employees"),
            founders,
            competitors,
            s.get("funding_stage"),
            s.get("funds_raised"),
            s.get("ref_funding"),
            s.get("investors"),
            s.get("tech_offering"),
            s.get("ref_tech"),
            s.get("uvp"),
            s.get("ref_uvp"),
            s.get("trl"),
            s.get("trl_explanation"),
            s.get("use_cases"),
        ),
    )

conn.commit()
cur.close()
conn.close()
print("✅ Insert complete with founders + competitors")
