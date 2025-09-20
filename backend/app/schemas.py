from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MoveCreate(BaseModel):
    from_square: str
    to_square: str
    promotion: Optional[str] = None


class MoveOut(BaseModel):
    id: int
    ply_number: int
    san: str
    from_square: str
    to_square: str
    promotion: Optional[str]
    timestamp: datetime
    hidden_for: Optional[List[str]]
    resulting_fen: str

    class Config:
        orm_mode = True


class GameCreate(BaseModel):
    white_player: str
    black_player: str


class GameOut(BaseModel):
    id: int
    white_player: str
    black_player: str
    current_fen: str
    moves: List[MoveOut] = []

    class Config:
        orm_mode = True
