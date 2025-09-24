from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from api.database import init_db, get_session
from api.models import Startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Create tables on startup
    yield  # Run the app
    # Cleanup logic (if any) on shutdown


app = FastAPI(title="Startups API", lifespan=lifespan)


@app.get("/startups/", response_model=list[Startup])
def list_startups(session: Session = Depends(get_session)):
    return session.exec(select(Startup)).all()


@app.get("/startups/{startup_id}", response_model=Startup)
def get_startup(startup_id: int, session: Session = Depends(get_session)):
    startup = session.get(Startup, startup_id)
    if not startup:
        return {"error": "Startup not found"}
    return startup
