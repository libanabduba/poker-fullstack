from typing import Dict, List, Tuple
import pokerkit
from ..domain.hand import Hand, PlayerSnapshot, Action, Board


class SettlementService:
    """Service for settling poker hands using pokerkit"""
    
    def validate_and_settle_hand(self, hand: Hand) -> Tuple[Dict[int, int], str]:
        """Validate hand and settle it, returning winnings and short line"""
        self._validate_hand(hand)
        winnings = self._settle_hand(hand)
        short_line = self._generate_short_line(hand)
        return winnings, short_line
    
    def _validate_hand(self, hand: Hand) -> None:
        """Validate hand structure and actions"""
        # Validate 6 players
        if len(hand.seats) != 6:
            raise ValueError("Hand must have exactly 6 players")
        
        # Validate roles
        roles = [seat.role for seat in hand.seats]
        required_roles = ["BTN", "SB", "BB", "UTG", "MP", "CO"]
        if sorted(roles) != sorted(required_roles):
            raise ValueError("Invalid player roles")
        
        # Validate blind postings - we'll assume blinds are posted correctly
        # since we don't track committed amounts in PlayerSnapshot
        pass
        
        # Validate actions
        self._validate_actions(hand)
        
        # Validate board consistency
        self._validate_board(hand)
    
    def _validate_actions(self, hand: Hand) -> None:
        """Validate action legality - simplified validation"""
        # Basic validation - check that actions are reasonable
        for action in hand.actions:
            if action.type not in ["f", "x", "c", "b", "r", "allin"]:
                raise ValueError(f"Invalid action type: {action.type}")
            if action.amount < 0:
                raise ValueError(f"Negative action amount: {action.amount}")
            if action.seat < 0 or action.seat >= 6:
                raise ValueError(f"Invalid seat: {action.seat}")
            if action.street not in ["preflop", "flop", "turn", "river"]:
                raise ValueError(f"Invalid street: {action.street}")
    
    def _validate_board(self, hand: Hand) -> None:
        """Validate board card consistency"""
        all_cards = set()
        
        # Check hole cards
        for cards_str in hand.hole_cards.values():
            cards = cards_str.split()
            for card in cards:
                if card in all_cards:
                    raise ValueError(f"Duplicate card: {card}")
                all_cards.add(card)
        
        # Check board cards
        board_cards = []
        if hand.board.flop:
            board_cards.extend(hand.board.flop.split())
        if hand.board.turn:
            board_cards.append(hand.board.turn)
        if hand.board.river:
            board_cards.append(hand.board.river)
        
        for card in board_cards:
            if card in all_cards:
                raise ValueError(f"Duplicate card: {card}")
            all_cards.add(card)
    
    def _settle_hand(self, hand: Hand) -> Dict[int, int]:
        """Settle hand - simplified implementation"""
        # For now, return zero winnings for all players
        # This is a placeholder - in a real implementation, we'd use pokerkit
        # to properly calculate hand rankings and winnings
        winnings = {}
        for i in range(6):
            winnings[i] = 0
        
        return winnings
    
    def _apply_street_actions(self, state: pokerkit.State, hand: Hand, street: str) -> None:
        """Apply actions for a specific street"""
        street_actions = [action for action in hand.actions if action.street == street]
        
        for action in street_actions:
            if action.type == "f":  # fold
                state.fold()
            elif action.type == "x":  # check
                state.check_or_call()
            elif action.type == "c":  # call
                state.check_or_call()
            elif action.type == "b":  # bet
                state.complete_bet_or_raise_to(action.amount)
            elif action.type == "r":  # raise
                state.complete_bet_or_raise_to(action.amount)
            elif action.type == "allin":
                state.complete_bet_or_raise_to(action.amount)
    
    def _generate_short_line(self, hand: Hand) -> str:
        """Generate canonical short line"""
        action_summary = []
        
        for action in hand.actions:
            player_name = f"Seat{action.seat}"
            if action.type == "f":
                action_summary.append(f"{player_name}:fold")
            elif action.type == "x":
                action_summary.append(f"{player_name}:check")
            elif action.type == "c":
                action_summary.append(f"{player_name}:call")
            elif action.type == "b":
                action_summary.append(f"{player_name}:bet{action.amount}")
            elif action.type == "r":
                action_summary.append(f"{player_name}:raise{action.amount}")
            elif action.type == "allin":
                action_summary.append(f"{player_name}:allin")
        
        board_parts = []
        if hand.board.flop:
            board_parts.append(f"Flop:{hand.board.flop}")
        if hand.board.turn:
            board_parts.append(f"Turn:{hand.board.turn}")
        if hand.board.river:
            board_parts.append(f"River:{hand.board.river}")
        
        return f"{' '.join(action_summary)} {' '.join(board_parts)}".strip()