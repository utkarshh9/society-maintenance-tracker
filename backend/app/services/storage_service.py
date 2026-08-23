import cloudinary
import cloudinary.uploader
from ..core.config import settings

class StorageService:
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        print(f"✅ Cloudinary configured for: {settings.CLOUDINARY_CLOUD_NAME}")
    
    def upload_image(self, file_content: bytes, filename: str) -> str:
        """Upload image to Cloudinary and return URL"""
        try:
            result = cloudinary.uploader.upload(
                file_content,
                folder="society-complaints",
                public_id=filename.split('.')[0],  # Remove extension
                resource_type="image",
                transformation=[
                    {"width": 1200, "crop": "limit"},
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"❌ Cloudinary upload error: {e}")
            raise

storage_service = StorageService()