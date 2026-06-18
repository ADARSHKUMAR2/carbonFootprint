import uuid
from datetime import datetime, UTC
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from pgvector.sqlalchemy import Vector

# The declarative base establishes the metaclass for all SQLAlchemy models
Base = declarative_base()


class Profile(Base):
    __tablename__ = "profiles"

    # Maps directly to the Supabase auth.users.id for strict identity management
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    # Relational bindings
    threads = relationship(
        "ChatThread", back_populates="owner", cascade="all, delete-orphan"
    )
    carbon_logs = relationship(
        "CarbonLog", back_populates="owner", cascade="all, delete-orphan"
    )


class ChatThread(Base):
    __tablename__ = "chat_threads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"))
    title = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    owner = relationship("Profile", back_populates="threads")
    messages = relationship(
        "ChatMessage", back_populates="thread", cascade="all, delete-orphan"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, ForeignKey("chat_threads.id", ondelete="CASCADE"))
    role = Column(String, nullable=False)  # Expected: "user", "assistant", or "system"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    thread = relationship("ChatThread", back_populates="messages")


class CarbonLog(Base):
    __tablename__ = "carbon_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"))
    category = Column(
        String, nullable=False
    )  # Expected: 'transport', 'diet', 'energy', 'waste'
    co2_emitted_kg = Column(Float, nullable=False)

    # JSONB is crucial here to store variable context (e.g., {"miles": 50, "vehicle": "gasoline"})
    structural_metadata = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    owner = relationship("Profile", back_populates="carbon_logs")


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    registry_tag = Column(String, unique=True, index=True)  # e.g., EPA-ELEC-2024
    category = Column(String, nullable=False)
    unit_type = Column(String, nullable=False)  # e.g., 'kWh', 'miles', 'gallons'
    description = Column(Text, nullable=False)

    # 1536 is the exact output dimension of OpenAI's text-embedding models (ada-002 and 3-small)
    embedding = Column(Vector(1536))

    # Postgres Full-Text Search vector for hybrid keyword/semantic matching
    search_vector = Column(TSVECTOR)
