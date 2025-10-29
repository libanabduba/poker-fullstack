from dataclasses import dataclass
from typing import Dict, List, Optional
from datetime import datetime


@dataclass
class PlayerSnapshot:
    seat: int
    name: str
    starting_stack: int
    role: str  # BTN, SB, BB, UTG, MP, CO


@dataclass
class Action:
    seat: int
    street: str  # preflop, flop, turn, river
    type: str  # f, x, c, b, r, allin
    amount: int


@dataclass
class Board:
    flop: Optional[str] = None
    turn: Optional[str] = None
    river: Optional[str] = None


@dataclass
class Hand:
    id: str
    created_at: datetime
    bb_size: int
    seats: List[PlayerSnapshot]
    hole_cards: Dict[int, str]  # seat -> cards
    board: Board
    actions: List[Action]
    short_line: str
    result: Dict[int, int]  # seat -> winnings

