import json
import psycopg2
from dotenv import load_dotenv
import os

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

with open("startups.json", "r", encoding="utf-8") as f:
    startups = json.load(f)

for s in startups:
    cur.execute(
        """
        INSERT INTO startups (
            company_name, company_website, year_founded, country, num_employees, founders, funding_stage, funds_raised,
            ref_funding, investors, tech_offering, ref_tech, uvp, ref_uvp, trl, trl_explanation
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """,
        (
            s["company_name"],
            s["company_website"],
            s["year_founded"],
            s["country"],
            s["num_employees"],
            json.dumps(s["founders"]),
            s["funding_stage"],
            s["funds_raised"],
            json.dumps(s["ref_funding"]),
            json.dumps(s["investors"]),
            s["tech_offering"],
            json.dumps(s["ref_tech"]),
            s["uvp"],
            json.dumps(s["ref_uvp"]),
            s["trl"],
            json.dumps(s["trl_explanation"]),
        ),
    )

conn.commit()
cur.close()
conn.close()
print("✅ Insert complete")
