from contextlib import asynccontextmanager
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from sqlmodel import Session, select
from api.database import init_db, get_session
from api.models import Startup
from api.routers import check_domain

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Create tables on startup
    yield  # Run the app
    # Cleanup logic (if any) on shutdown


app = FastAPI(title="Startups API", lifespan=lifespan)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)
# Allow localhost:3000 (Next.js dev server)
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # list of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # allow all headers
)

app.include_router(check_domain.router, prefix="/check-domain")


@app.get("/startups/", response_model=list[Startup])
def list_startups(session: Session = Depends(get_session)):
    return session.exec(select(Startup)).all()


@app.get("/startups/{startup_id}", response_model=Startup)
def get_startup(startup_id: int, session: Session = Depends(get_session)):
    startup = session.get(Startup, startup_id)
    if not startup:
        return {"error": "Startup not found"}
    return startup


@app.get("/lookup/startups/{startup_url}", response_model=Startup)
def lookup_startup(startup_url: str, session: Session = Depends(get_session)):
    with open("api/instruction.txt", "r", encoding="utf-8") as f:
        instruction = f.read()
    with open("api/input_template.txt", "r", encoding="utf-8") as f:
        input_template = f.read()
    input = f"{', '.join(startup_url)}: {input_template}"
    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort": "low"},
        instructions=instruction,
        input=input,
        store=True,
        tools=[{"type": "web_search"}],
        stream=False,
    )
    startup_info = json.loads(response.output_text)
    startup = Startup.model_validate(startup_info)
    session.add(startup)
    session.commit()
    session.refresh(startup)
    if not startup:
        return {"error": "Startup not found"}
    return startup
