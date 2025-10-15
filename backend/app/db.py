from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Prefer env DATABASE_URL; fall back to local SQLite for dev
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite+aiosqlite:///./blind_chess.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
