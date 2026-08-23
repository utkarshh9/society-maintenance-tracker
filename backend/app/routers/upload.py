from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..dependencies.auth import get_current_user
from ..services.storage_service import storage_service
from ..models.user import User
import uuid

router = APIRouter()

@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a complaint photo to Cloudinary"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(allowed_types)}"
        )
    
    # Validate file size (5MB max)
    contents = await file.read()
    file_size = len(contents)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Max 5MB"
        )
    
    try:
        # Generate unique filename
        unique_id = uuid.uuid4().hex[:8]
        filename = f"complaint_{current_user.id}_{unique_id}_{file.filename}"
        
        # Upload to Cloudinary
        url = storage_service.upload_image(contents, filename)
        
        return {
            "success": True,
            "url": url,
            "filename": filename,
            "size": file_size
        }
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )