from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine, Base
from .routers import auth_router, complaints_router, notices_router, dashboard_router, upload_router, email_router, scheduler_router

# Overdue Service Imports
from .services.overdue_service import overdue_service
from .core.database import SessionLocal
import threading
import time

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
    allow_origins=["http://localhost:3000",
                   "http://localhost:8000",
                   "https://society-maintenance-tracker-platform.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(complaints_router, prefix="/api/complaints", tags=["complaints"])
app.include_router(notices_router, prefix="/api/notices", tags=["notices"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(upload_router, prefix="/api/upload", tags=["upload"])
app.include_router(email_router, prefix="/api/email", tags=["email"])
app.include_router(scheduler_router, prefix="/api/scheduler", tags=["scheduler"])

@app.get("/")
async def root():
    return {"message": "Society Maintenance Tracker API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ============================================
# START OVERDUE SCHEDULER
# ============================================
def start_overdue_scheduler():
    """Run overdue check daily in background"""
    def scheduler_loop():
        # Run immediately on startup
        db = SessionLocal()
        print("🔍 Running initial overdue check...")
        overdue_service.send_overdue_reminder(db)
        db.close()
        
        # Then every 24 hours
        while True:
            time.sleep(24 * 60 * 60)  # 24 hours
            db = SessionLocal()
            print("🔍 Running daily overdue check...")
            overdue_service.send_overdue_reminder(db)
            db.close()
    
    thread = threading.Thread(target=scheduler_loop, daemon=True)
    thread.start()
    print("🔄 Overdue reminder scheduler started (runs daily)")

# Start the scheduler
start_overdue_scheduler()