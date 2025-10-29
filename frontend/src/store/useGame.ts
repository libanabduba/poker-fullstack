import { create } from 'zustand';
import { PokerEngine } from '../lib/game/engine';
import { GameState, Player, ActionType } from '../lib/game/types';

interface GameStore {
  engine: PokerEngine;
  gameState: GameState;
  betAmount: number;
  isStarted: boolean;
  
  // Actions
  startNewHand: () => void;
  resetHand: () => void;
  randomizeStacks: () => void;
  setBetAmount: (amount: number) => void;
  makeAction: (actionType: ActionType) => void;
  updateGameState: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  engine: new PokerEngine(40),
  gameState: {
    seats: [],
    currentStreet: 'preflop' as any,
    pot: 0,
    lastRaiseTo: 0,
    currentPlayer: 0,
    board: {},
    holeCards: {},
    actions: [],
    shortLine: '',
    isComplete: false
  },
  betAmount: 40,
  isStarted: false,

  startNewHand: () => {
    const { engine } = get();
    engine.resetHand();
    set({ 
      isStarted: true,
      gameState: engine.getState(),
      betAmount: 40
    });
  },

  resetHand: () => {
    const { engine } = get();
    engine.resetHand();
    set({ 
      isStarted: false,
      gameState: engine.getState(),
      betAmount: 40
    });
  },

  randomizeStacks: () => {
    const { engine } = get();
    const state = engine.getState();
    
    // Randomize stack sizes between 500-2000
    state.seats.forEach(player => {
      player.stack = Math.floor(Math.random() * 1500) + 500;
    });
    
    set({ gameState: state });
  },

  setBetAmount: (amount: number) => {
    set({ betAmount: Math.max(40, amount) });
  },

  makeAction: (actionType: ActionType) => {
    const { engine, betAmount } = get();
    const success = engine.applyAction(actionType, betAmount);
    
    if (success) {
      set({ 
        gameState: engine.getState(),
        betAmount: 40 // Reset bet amount after action
      });
    }
  },

  updateGameState: () => {
    const { engine } = get();
    set({ gameState: engine.getState() });
  }
}));

