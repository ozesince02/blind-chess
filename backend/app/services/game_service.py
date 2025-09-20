from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from .. import models
import chess
from typing import Tuple, List, Dict, Any, Optional


async def submit_move(db: AsyncSession, game_id: int, player: str, from_square: str, to_square: str, promotion: Optional[str] = None) -> Tuple[models.Move, str, List[models.Move]]:
    """Validate and apply a move atomically using python-chess.

    Returns the created Move and the opponent id.
    Raises ValueError on invalid input or illegal move.
    """
    # load game
    q = await db.execute(select(models.Game).where(models.Game.id == game_id))
    game = q.scalars().first()
    if not game:
        raise ValueError("game not found")

    # determine board from current_fen
    if game.current_fen:
        board = chess.Board(game.current_fen)
    else:
        board = chess.Board()

    # construct UCI move
    uci = f"{from_square}{to_square}"
    if promotion:
        uci += promotion.lower()[0]

    try:
        move = chess.Move.from_uci(uci)
    except Exception:
        raise ValueError("invalid move format")

    if move not in board.legal_moves:
        raise ValueError("illegal move")

    # SAN before pushing
    san = board.san(move)
    board.push(move)
    resulting_fen = board.fen()

    # compute next ply_number
    q2 = await db.execute(select(func.max(models.Move.ply_number)).where(models.Move.game_id == game_id))
    max_ply = q2.scalar()
    next_ply = (max_ply or 0) + 1

    # validate player is in game and find opponent
    if player == game.white_player:
        opponent = game.black_player
    elif player == game.black_player:
        opponent = game.white_player
    else:
        raise ValueError("player not in game")

    # create move record inside transaction
    revealed_moves = []
    async with db.begin():
        move_obj = models.Move(
            game_id=game_id,
            ply_number=next_ply,
            san=san,
            from_square=from_square,
            to_square=to_square,
            promotion=promotion,
            hidden_for=[opponent],
            resulting_fen=resulting_fen,
        )
        db.add(move_obj)
        # update game's authoritative fen
        game.current_fen = resulting_fen
        db.add(game)

        # find moves that were hidden for the submitting player and reveal them
        q3 = await db.execute(select(models.Move).where(models.Move.game_id == game_id))
        all_moves = q3.scalars().all()
        for m in all_moves:
            if m.hidden_for and player in m.hidden_for:
                # remove player from hidden_for
                new_hidden = [h for h in m.hidden_for if h != player]
                m.hidden_for = new_hidden or None
                db.add(m)
                revealed_moves.append(m)

    # refresh created objects
    await db.refresh(move_obj)
    await db.refresh(game)
    return move_obj, opponent, revealed_moves


async def get_board_view(db: AsyncSession, game_id: int, player: str) -> Dict[str, Any]:
    """Return the board fen and visible moves for a player, masking moves hidden for them.

    Visible moves are applied in order to reconstruct the board state the player should see.
    """
    q = await db.execute(select(models.Game).where(models.Game.id == game_id))
    game = q.scalars().first()
    if not game:
        raise ValueError("game not found")

    # select moves ordered by ply_number
    q2 = await db.execute(select(models.Move).where(models.Move.game_id == game_id).order_by(models.Move.ply_number))
    all_moves: List[models.Move] = q2.scalars().all()

    board = chess.Board()
    visible_moves = []
    for m in all_moves:
        # if hidden_for contains the requesting player, skip applying it
        if m.hidden_for and player in m.hidden_for:
            # skip applying; it's hidden to this player
            continue
        # apply move
        try:
            move = chess.Move.from_uci(f"{m.from_square}{m.to_square}" + (m.promotion[0].lower() if m.promotion else ""))
        except Exception:
            # ignore malformed stored moves
            continue
        if move in board.legal_moves:
            board.push(move)
            visible_moves.append(m)
        else:
            # If stored move isn't legal in reconstructed board, stop to avoid corrupting view
            break

    return {"fen": board.fen(), "visible_moves": visible_moves}
