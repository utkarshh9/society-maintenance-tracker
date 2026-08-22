from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .routers import auth_router, complaints_router, notices_router, dashboard_router

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

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(complaints_router, prefix="/api/complaints", tags=["complaints"])
app.include_router(notices_router, prefix="/api/notices", tags=["notices"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
async def root():
    return {"message": "Society Maintenance Tracker API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}