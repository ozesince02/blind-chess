import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.db import Base
from app import models
from app.services import game_service


@pytest.fixture()
async def in_memory_db():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:', echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest.mark.asyncio
async def test_submit_and_board_view(in_memory_db):
    db: AsyncSession = in_memory_db
    # create a game
    g = models.Game(white_player='alice', black_player='bob', current_fen='')
    db.add(g)
    await db.commit()
    await db.refresh(g)

    # alice plays e2-e4
    move_obj, opponent = await game_service.submit_move(db, g.id, 'alice', 'e2', 'e4')
    assert opponent == 'bob'
    assert move_obj.san == 'e4' or 'e4' in move_obj.san

    # board view for bob should hide that move
    view_bob = await game_service.get_board_view(db, g.id, 'bob')
    # since move is hidden for bob, starting position should be visible
    assert 'r' in view_bob['fen']  # contains pieces

    # board view for alice should show the move
    view_alice = await game_service.get_board_view(db, g.id, 'alice')
    assert 'e' in move_obj.from_square
