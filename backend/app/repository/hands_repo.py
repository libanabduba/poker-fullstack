import json
import uuid
from typing import List, Optional
from datetime import datetime

from .connection import DatabaseConnection
from ..domain.hand import Hand, PlayerSnapshot, Action, Board


class HandsRepository:
    def __init__(self, db_connection: DatabaseConnection):
        self.db = db_connection
    
    async def save(self, hand: Hand) -> None:
        """Save a hand to the database"""
        async with self.db.get_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    """
                    INSERT INTO hands (id, created_at, bb_size, seats_json, hole_cards_json, 
                                     board_json, actions_json, short_line, result_json)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        hand.id,
                        hand.created_at,
                        hand.bb_size,
                        json.dumps([self._serialize_player(p) for p in hand.seats]),
                        json.dumps(hand.hole_cards),
                        json.dumps(self._serialize_board(hand.board)),
                        json.dumps([self._serialize_action(a) for a in hand.actions]),
                        hand.short_line,
                        json.dumps(hand.result)
                    )
                )
    
    async def get(self, hand_id: str) -> Optional[Hand]:
        """Get a hand by ID"""
        async with self.db.get_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT * FROM hands WHERE id = %s",
                    (hand_id,)
                )
                row = await cur.fetchone()
                if row:
                    return self._deserialize_hand(row)
                return None
    
    async def list(self, limit: int = 50, offset: int = 0) -> List[Hand]:
        """List hands with pagination"""
        async with self.db.get_connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(
                    "SELECT * FROM hands ORDER BY created_at DESC LIMIT %s OFFSET %s",
                    (limit, offset)
                )
                rows = await cur.fetchall()
                return [self._deserialize_hand(row) for row in rows]
    
    def _serialize_player(self, player: PlayerSnapshot) -> dict:
        return {
            "seat": player.seat,
            "name": player.name,
            "starting_stack": player.starting_stack,
            "role": player.role
        }
    
    def _serialize_board(self, board: Board) -> dict:
        return {
            "flop": board.flop,
            "turn": board.turn,
            "river": board.river
        }
    
    def _serialize_action(self, action: Action) -> dict:
        return {
            "seat": action.seat,
            "street": action.street,
            "type": action.type,
            "amount": action.amount
        }
    
    def _deserialize_hand(self, row) -> Hand:
        seats_data = json.loads(row[3])
        seats = [PlayerSnapshot(**p) for p in seats_data]
        
        hole_cards = json.loads(row[4])
        
        board_data = json.loads(row[5])
        board = Board(**board_data)
        
        actions_data = json.loads(row[6])
        actions = [Action(**a) for a in actions_data]
        
        result = json.loads(row[8])
        
        return Hand(
            id=row[0],
            created_at=row[1],
            bb_size=row[2],
            seats=seats,
            hole_cards=hole_cards,
            board=board,
            actions=actions,
            short_line=row[7],
            result=result
        )

