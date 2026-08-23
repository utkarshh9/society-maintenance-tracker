from .auth import router as auth_router
from .complaints import router as complaints_router
from .notices import router as notices_router
from .dashboard import router as dashboard_router
from .upload import router as upload_router
from .email import router as email_router

__all__ = [
    "auth_router",
    "complaints_router", 
    "notices_router",
    "dashboard_router",
    "upload_router"
    "email_router"
]