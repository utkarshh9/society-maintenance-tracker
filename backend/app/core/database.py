from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Add connection pooling and timeout settings
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=5,                    # Keep 5 connections ready
    max_overflow=10,                # Allow 10 extra connections
    pool_pre_ping=True,             # Check connection before using
    pool_recycle=3600,              # Recycle connections every hour
    connect_args={
        "connect_timeout": 30,      # Wait up to 30 seconds for connection
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()