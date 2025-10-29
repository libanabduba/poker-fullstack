from enum import Enum
from typing import Dict, List, Optional
from dataclasses import dataclass


class ActionType(Enum):
    FOLD = "f"
    CHECK = "x"
    CALL = "c"
    BET = "b"
    RAISE = "r"
    ALL_IN = "allin"


class Street(Enum):
    PREFLOP = "preflop"
    FLOP = "flop"
    TURN = "turn"
    RIVER = "river"


@dataclass
class GameState:
    seats: List[Dict]
    current_street: Street
    pot: int
    last_raise_to: int
    current_player: int
    board: Optional[str] = None
    hole_cards: Optional[Dict[int, str]] = None


def validate_action(action_type: ActionType, amount: int, game_state: GameState) -> bool:
    """Validate if an action is legal given current game state"""
    # Basic validation logic - will be expanded
    if action_type == ActionType.FOLD:
        return True
    elif action_type == ActionType.CHECK:
        return game_state.pot == 0 or amount == 0
    elif action_type in [ActionType.CALL, ActionType.BET, ActionType.RAISE]:
        return amount > 0
    elif action_type == ActionType.ALL_IN:
        return True
    return False

