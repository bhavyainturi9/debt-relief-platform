from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import loans, negotiation, dashboard

# Create all tables on startup (SQLite file is created automatically too)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Debt Relief & Financial Recovery Platform",
    description="APIs for loan management, AI settlement recommendations, "
                "negotiation letter generation, and financial health tracking.",
    version="1.0.0",
)

# Allow the React dev server (and any origin, for simplicity in dev) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(loans.router)
app.include_router(negotiation.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "message": "AI-Powered Debt Relief & Financial Recovery Platform API",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
