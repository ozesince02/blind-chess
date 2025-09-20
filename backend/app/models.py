from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base


class Game(Base):
    __tablename__ = "games"
    id = Column(Integer, primary_key=True)
    white_player = Column(String, nullable=False)
    black_player = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # fen of the current authoritative board
    current_fen = Column(Text, nullable=False, default="")
    moves = relationship("Move", back_populates="game", cascade="all, delete-orphan")


class Move(Base):
    __tablename__ = "moves"
    id = Column(Integer, primary_key=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    ply_number = Column(Integer, nullable=False)
    san = Column(String, nullable=False)
    from_square = Column(String, nullable=False)
    to_square = Column(String, nullable=False)
    promotion = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    hidden_for = Column(JSON, nullable=True)  # list of player ids (or colors) for whom this move is hidden
    resulting_fen = Column(Text, nullable=False)

    game = relationship("Game", back_populates="moves")
