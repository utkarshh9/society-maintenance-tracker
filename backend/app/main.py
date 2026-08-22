from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .routers import auth, complaints, notices, dashboard

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Society Maintenance Tracker API",
    description="API for managing society maintenance complaints",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["complaints"])
app.include_router(notices.router, prefix="/api/notices", tags=["notices"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
async def root():
    return {"message": "Society Maintenance Tracker API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}