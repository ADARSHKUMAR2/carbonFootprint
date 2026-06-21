from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Convert the Pydantic DSN to a standard string format for the engine connection
# We enforce pool_pre_ping to automatically reconnect if the cloud connection drops
engine = create_engine(
    str(settings.DATABASE_URL), pool_pre_ping=True, pool_size=10, max_overflow=20
)

# This factory will be utilized by FastAPI dependencies to yield request-scoped sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
