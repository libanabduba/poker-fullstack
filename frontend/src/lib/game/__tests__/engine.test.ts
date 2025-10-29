import { PokerEngine } from '../engine';
import { ActionType, Street } from '../types';

describe('PokerEngine', () => {
  let engine: PokerEngine;

  beforeEach(() => {
    engine = new PokerEngine(40, 12345); // Fixed seed for deterministic tests
  });

  describe('resetHand', () => {
    it('should initialize a new hand with 6 players', () => {
      engine.resetHand();
      const state = engine.getState();
      
      expect(state.seats).toHaveLength(6);
      expect(state.currentStreet).toBe(Street.PREFLOP);
      expect(state.pot).toBeGreaterThan(0); // Blinds posted
      expect(state.isComplete).toBe(false);
    });

    it('should assign roles correctly', () => {
      engine.resetHand();
      const state = engine.getState();
      
      const roles = state.seats.map(p => p.role);
      expect(roles).toContain('BTN');
      expect(roles).toContain('SB');
      expect(roles).toContain('BB');
      expect(roles).toContain('UTG');
      expect(roles).toContain('MP');
      expect(roles).toContain('CO');
    });

    it('should post blinds correctly', () => {
      engine.resetHand();
      const state = engine.getState();
      
      const sbPlayer = state.seats.find(p => p.role === 'SB');
      const bbPlayer = state.seats.find(p => p.role === 'BB');
      
      expect(sbPlayer?.committed).toBe(20); // SB = BB/2
      expect(bbPlayer?.committed).toBe(40); // BB
      expect(state.pot).toBe(60); // SB + BB
    });

    it('should deal hole cards to all players', () => {
      engine.resetHand();
      const state = engine.getState();
      
      for (let seat = 0; seat < 6; seat++) {
        expect(state.holeCards[seat]).toBeDefined();
        expect(state.holeCards[seat].split(' ')).toHaveLength(2);
      }
    });
  });

  describe('getLegalActions', () => {
    beforeEach(() => {
      engine.resetHand();
    });

    it('should return correct actions for BB player', () => {
      const state = engine.getState();
      const bbPlayer = state.seats.find(p => p.role === 'BB');
      
      if (bbPlayer) {
        const legalActions = engine.getLegalActions(bbPlayer.seat);
        expect(legalActions).toContain(ActionType.CHECK);
        expect(legalActions).toContain(ActionType.BET);
        expect(legalActions).toContain(ActionType.FOLD);
        expect(legalActions).toContain(ActionType.ALL_IN);
      }
    });

    it('should return correct actions for UTG player', () => {
      const state = engine.getState();
      const utgPlayer = state.seats.find(p => p.role === 'UTG');
      
      if (utgPlayer) {
        const legalActions = engine.getLegalActions(utgPlayer.seat);
        expect(legalActions).toContain(ActionType.CALL);
        expect(legalActions).toContain(ActionType.RAISE);
        expect(legalActions).toContain(ActionType.FOLD);
        expect(legalActions).toContain(ActionType.ALL_IN);
      }
    });

    it('should not return actions for folded players', () => {
      const state = engine.getState();
      const player = state.seats[0];
      
      // Fold the player
      engine.applyAction(ActionType.FOLD);
      
      const legalActions = engine.getLegalActions(player.seat);
      expect(legalActions).toHaveLength(0);
    });
  });

  describe('applyAction', () => {
    beforeEach(() => {
      engine.resetHand();
    });

    it('should apply fold action correctly', () => {
      const state = engine.getState();
      const currentPlayer = engine.getCurrentPlayer();
      
      const success = engine.applyAction(ActionType.FOLD);
      
      expect(success).toBe(true);
      expect(currentPlayer?.inHand).toBe(false);
    });

    it('should apply call action correctly', () => {
      const state = engine.getState();
      const utgPlayer = state.seats.find(p => p.role === 'UTG');
      
      if (utgPlayer) {
        const initialStack = utgPlayer.stack;
        const success = engine.applyAction(ActionType.CALL);
        
        expect(success).toBe(true);
        expect(utgPlayer.stack).toBe(initialStack - 40); // Call BB
        expect(utgPlayer.committed).toBe(40);
      }
    });

    it('should apply bet action correctly', () => {
      const state = engine.getState();
      const bbPlayer = state.seats.find(p => p.role === 'BB');
      
      if (bbPlayer) {
        const initialStack = bbPlayer.stack;
        const success = engine.applyAction(ActionType.BET, 80);
        
        expect(success).toBe(true);
        expect(bbPlayer.stack).toBe(initialStack - 80);
        expect(bbPlayer.committed).toBe(40 + 80); // BB + bet
      }
    });

    it('should enforce minimum bet size', () => {
      const state = engine.getState();
      const bbPlayer = state.seats.find(p => p.role === 'BB');
      
      if (bbPlayer) {
        const success = engine.applyAction(ActionType.BET, 20); // Less than BB
        
        expect(success).toBe(true);
        expect(bbPlayer.committed).toBe(40 + 40); // BB + minimum bet (BB size)
      }
    });

    it('should prevent illegal actions', () => {
      const state = engine.getState();
      const bbPlayer = state.seats.find(p => p.role === 'BB');
      
      if (bbPlayer) {
        // Try to call when BB can check
        const success = engine.applyAction(ActionType.CALL);
        
        expect(success).toBe(false);
      }
    });
  });

  describe('street advancement', () => {
    beforeEach(() => {
      engine.resetHand();
    });

    it('should advance to flop after preflop betting', () => {
      // Simulate preflop betting completion
      const state = engine.getState();
      
      // Make all players fold except one
      for (let i = 0; i < 5; i++) {
        engine.applyAction(ActionType.FOLD);
      }
      
      // Last player checks
      engine.applyAction(ActionType.CHECK);
      
      expect(state.currentStreet).toBe(Street.FLOP);
      expect(state.board.flop).toBeDefined();
    });

    it('should deal board cards correctly', () => {
      engine.resetHand();
      
      // Complete preflop
      for (let i = 0; i < 5; i++) {
        engine.applyAction(ActionType.FOLD);
      }
      engine.applyAction(ActionType.CHECK);
      
      const state = engine.getState();
      expect(state.board.flop).toBeDefined();
      expect(state.board.flop!.split(' ')).toHaveLength(3);
    });
  });

  describe('hand completion', () => {
    beforeEach(() => {
      engine.resetHand();
    });

    it('should complete hand when only one player remains', () => {
      // Fold all players except one
      for (let i = 0; i < 5; i++) {
        engine.applyAction(ActionType.FOLD);
      }
      
      expect(engine.isHandComplete()).toBe(true);
    });

    it('should complete hand after river betting', () => {
      // Complete all streets
      for (let street = 0; street < 4; street++) {
        for (let i = 0; i < 5; i++) {
          engine.applyAction(ActionType.FOLD);
        }
        engine.applyAction(ActionType.CHECK);
      }
      
      expect(engine.isHandComplete()).toBe(true);
    });
  });

  describe('generateShortLine', () => {
    it('should generate correct short line', () => {
      engine.resetHand();
      
      // Make some actions
      engine.applyAction(ActionType.RAISE, 120);
      engine.applyAction(ActionType.CALL);
      engine.applyAction(ActionType.FOLD);
      
      const shortLine = engine.generateShortLine();
      expect(shortLine).toContain('raise120');
      expect(shortLine).toContain('call');
      expect(shortLine).toContain('fold');
    });
  });
});

