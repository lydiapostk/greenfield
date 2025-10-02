from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from api.database import init_db
from api.routers import evaluations, lookup, startups, workstreams

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
app.include_router(startups.router, prefix="/startups")
app.include_router(lookup.router, prefix="/lookup")
app.include_router(workstreams.router, prefix="/workstreams")
app.include_router(evaluations.router, prefix="/evaluations")
