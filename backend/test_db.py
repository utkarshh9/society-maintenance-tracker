from app.core.database import engine
from app.core.config import settings

print(f"Database URL: {settings.DATABASE_URL}")
print("Testing connection...")
try:
    with engine.connect() as conn:
        print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")