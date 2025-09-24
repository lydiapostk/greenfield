import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

# Load root .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

PG_USER = os.getenv("POSTGRES_USER")
PG_PASS = os.getenv("POSTGRES_PASSWORD")
PG_DB   = os.getenv("POSTGRES_DB")
PG_HOST = os.getenv("POSTGRES_HOST", "localhost")
PG_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASS}@{PG_HOST}:{PG_PORT}/{PG_DB}"
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
