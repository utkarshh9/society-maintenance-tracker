import cloudinary
import cloudinary.uploader
from ..core.config import settings

class StorageService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
    
    def upload_image(self, file_content, filename):
        try:
            result = cloudinary.uploader.upload(
                file_content,
                folder="society-complaints",
                public_id=filename,
                resource_type="image"
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"Upload error: {e}")
            raise

storage_service = StorageService()