from fastapi import APIRouter, Depends, HTTPException
from typing import List
from .. import models, schemas
from ..db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..services import game_service

router = APIRouter()


@router.post("/", response_model=schemas.GameOut)
async def create_game(payload: schemas.GameCreate, db: AsyncSession = Depends(get_db)):
    game = models.Game(white_player=payload.white_player, black_player=payload.black_player, current_fen="")
    db.add(game)
    await db.commit()
    await db.refresh(game)
    return game


@router.get("/{game_id}", response_model=schemas.GameOut)
async def get_game(game_id: int, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(models.Game).where(models.Game.id == game_id))
    game = q.scalars().first()
    if not game:
        raise HTTPException(status_code=404, detail="game not found")
    return game


@router.get("/{game_id}/board-view")
async def board_view(game_id: int, player: str, db: AsyncSession = Depends(get_db)):
    """Return the board as visible to the requesting player (mask hidden moves)."""
    try:
        view = await game_service.get_board_view(db, game_id, player)
    except ValueError:
        raise HTTPException(status_code=404, detail="game not found")
    # serialize visible moves using pydantic schema
    moves_out = [schemas.MoveOut.from_orm(m) for m in view["visible_moves"]]
    return {"id": game_id, "fen": view["fen"], "moves": moves_out}


@router.post("/{game_id}/moves")
async def submit_move(game_id: int, move: schemas.MoveCreate, player: str, db: AsyncSession = Depends(get_db)):
    """Atomic move submission: validate with python-chess, apply to authoritative board, record move with hidden_for."""
    try:
        move_obj, opponent, revealed = await game_service.submit_move(db, game_id, player, move.from_square, move.to_square, move.promotion)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # emit socket events
    try:
        from ..socketio_server import sio
        # notify opponent room about a new hidden move
        await sio.emit('move_submitted', {'game_id': game_id, 'by': player, 'san': move_obj.san}, room=f'game_{game_id}')
        # notify submitting player about any revealed moves
        if revealed:
            data = [{'id': m.id, 'san': m.san, 'from': m.from_square, 'to': m.to_square} for m in revealed]
            await sio.emit('moves_revealed', {'game_id': game_id, 'revealed': data}, room=f'game_{game_id}')
    except Exception:
        # do not fail request if socket emit fails
        pass

    return schemas.MoveOut.from_orm(move_obj)
