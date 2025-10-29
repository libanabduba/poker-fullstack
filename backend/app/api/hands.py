from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

from ..domain.hand import Hand, PlayerSnapshot, Action, Board
from ..repository.hands_repo import HandsRepository
from ..repository.connection import DatabaseConnection
from ..services.settlement import SettlementService


router = APIRouter()

# Initialize services
db_connection = DatabaseConnection()
hands_repo = HandsRepository(db_connection)
settlement_service = SettlementService()


class HandRequest(BaseModel):
    bb_size: int
    seats: List[dict]
    hole_cards: dict
    board: dict
    actions: List[dict]


class HandResponse(BaseModel):
    id: str
    result: dict
    short_line: str


@router.get("/hands")
async def list_hands(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> List[dict]:
    """List hands with pagination"""
    hands = await hands_repo.list(limit=limit, offset=offset)
    return [
        {
            "id": hand.id,
            "created_at": hand.created_at.isoformat(),
            "bb_size": hand.bb_size,
            "short_line": hand.short_line,
            "result": hand.result
        }
        for hand in hands
    ]


@router.get("/hands/{hand_id}")
async def get_hand(hand_id: str) -> dict:
    """Get a specific hand by ID"""
    hand = await hands_repo.get(hand_id)
    if not hand:
        raise HTTPException(status_code=404, detail="Hand not found")
    
    return {
        "id": hand.id,
        "created_at": hand.created_at.isoformat(),
        "bb_size": hand.bb_size,
        "seats": [
            {
                "seat": s.seat,
                "name": s.name,
                "starting_stack": s.starting_stack,
                "role": s.role
            }
            for s in hand.seats
        ],
        "hole_cards": hand.hole_cards,
        "board": {
            "flop": hand.board.flop,
            "turn": hand.board.turn,
            "river": hand.board.river
        },
        "actions": [
            {
                "seat": a.seat,
                "street": a.street,
                "type": a.type,
                "amount": a.amount
            }
            for a in hand.actions
        ],
        "short_line": hand.short_line,
        "result": hand.result
    }


@router.post("/hands", response_model=HandResponse)
async def create_hand(request: HandRequest) -> HandResponse:
    """Create a new hand with validation and settlement"""
    
    # Validate request
    if len(request.seats) != 6:
        raise HTTPException(status_code=422, detail="Must have exactly 6 players")
    
    # Check roles
    roles = {seat["role"] for seat in request.seats}
    required_roles = {"BTN", "SB", "BB", "UTG", "MP", "CO"}
    if roles != required_roles:
        raise HTTPException(status_code=422, detail=f"Invalid roles. Required: {required_roles}")
    
    # Create domain objects
    seats = [PlayerSnapshot(**seat) for seat in request.seats]
    board = Board(**request.board)
    actions = [Action(**action) for action in request.actions]
    
    # Create hand
    hand = Hand(
        id=str(uuid.uuid4()),
        created_at=datetime.utcnow(),
        bb_size=request.bb_size,
        seats=seats,
        hole_cards=request.hole_cards,
        board=board,
        actions=actions,
        short_line="",  # Will be generated
        result={}  # Will be calculated
    )
    
    # Validate and settle the hand
    try:
        result, short_line = settlement_service.validate_and_settle_hand(hand)
        hand.result = result
        hand.short_line = short_line
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # Save to database
    await hands_repo.save(hand)
    
    return HandResponse(
        id=hand.id,
        result=hand.result,
        short_line=hand.short_line
    )
