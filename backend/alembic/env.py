import asyncio
from logging.config import fileConfig
import os

# On Windows, the default ProactorEventLoop can raise 'Event loop is closed'
# during interpreter shutdown when objects with proactor handles are finalized.
# Use the selector event loop policy for Alembic runs on Windows to avoid
# the spurious finalizer RuntimeError.
if os.name == 'nt':
    try:
        from asyncio import WindowsSelectorEventLoopPolicy
        asyncio.set_event_loop_policy(WindowsSelectorEventLoopPolicy())
    except Exception:
        # If unavailable (very old Python), continue with default policy
        pass

from sqlalchemy import pool
from sqlalchemy.engine import Connection

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# add app to path
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import create_async_engine

# Import Base metadata from app.db (this will not connect to the DB by itself)
from app.db import Base

# Import models so that `Base.metadata` is populated for autogenerate

import app.models  # noqa: F401 (imports for side-effects)



target_metadata = Base.metadata

# Prefer DATABASE_URL from the environment. If not set, try loading
# backend/.env (useful when running alembic from the backend folder).
db_url = os.getenv("DATABASE_URL")
if not db_url:
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' not in line:
                    continue
                k, v = line.split('=', 1)
                if k.strip() == 'DATABASE_URL':
                    db_url = v.strip().strip('"').strip("'")
                    break

if db_url:
    config.set_main_option('sqlalchemy.url', db_url)


# Create an async engine for Alembic using the resolved URL. We avoid
# importing a pre-created engine from app.db so that the URL used here
# always matches the environment or backend/.env when running alembic
# locally.
engine = create_async_engine(config.get_main_option('sqlalchemy.url'), echo=False)


def run_migrations_offline():
    raise RuntimeError("Offline migrations not supported; use 'alembic upgrade' with an active DB")


def do_run_migrations(connection: Connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    async with engine.begin() as conn:
        await conn.run_sync(do_run_migrations)


def run_migrations_online():
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
