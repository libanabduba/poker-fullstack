import { GameState, Player, Action, ActionType, Street, Board, ROLES, CARDS } from './types';

export class PokerEngine {
  private state: GameState;
  private bbSize: number;
  private seed?: number;

  constructor(bbSize: number = 40, seed?: number) {
    this.bbSize = bbSize;
    this.seed = seed;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      seats: [],
      currentStreet: Street.PREFLOP,
      pot: 0,
      lastRaiseTo: 0,
      currentPlayer: 0,
      board: {},
      holeCards: {},
      actions: [],
      shortLine: "",
      isComplete: false
    };
  }

  resetHand(seed?: number): void {
    this.seed = seed;
    this.state = this.createInitialState();
    this.assignRoles();
    this.postBlinds();
    this.dealHoleCards();
    this.updateCurrentPlayer();
  }

  private assignRoles(): void {
    const shuffledSeats = this.shuffleArray([0, 1, 2, 3, 4, 5]);
    
    this.state.seats = shuffledSeats.map((seat, index) => ({
      seat,
      name: `Player${seat}`,
      stack: 1000,
      role: ROLES[index],
      inHand: true,
      committed: 0
    }));
  }

  private postBlinds(): void {
    const sbSeat = this.state.seats.find(p => p.role === "SB")?.seat;
    const bbSeat = this.state.seats.find(p => p.role === "BB")?.seat;
    
    if (sbSeat !== undefined && bbSeat !== undefined) {
      const sbPlayer = this.state.seats[sbSeat];
      const bbPlayer = this.state.seats[bbSeat];
      
      const sbAmount = Math.min(this.bbSize / 2, sbPlayer.stack);
      const bbAmount = Math.min(this.bbSize, bbPlayer.stack);
      
      sbPlayer.stack -= sbAmount;
      sbPlayer.committed = sbAmount;
      bbPlayer.stack -= bbAmount;
      bbPlayer.committed = bbAmount;
      
      this.state.pot = sbAmount + bbAmount;
      this.state.lastRaiseTo = bbAmount;
    }
  }

  private dealHoleCards(): void {
    const shuffledCards = this.shuffleArray([...CARDS]);
    let cardIndex = 0;
    
    for (let seat = 0; seat < 6; seat++) {
      const card1 = shuffledCards[cardIndex++];
      const card2 = shuffledCards[cardIndex++];
      this.state.holeCards[seat] = `${card1} ${card2}`;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    const random = this.seed ? this.seededRandom() : Math.random;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  private seededRandom(): () => number {
    let seed = this.seed || 1;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  getLegalActions(seat: number): ActionType[] {
    const player = this.state.seats[seat];
    if (!player || !player.inHand || this.state.currentPlayer !== seat) {
      return [];
    }

    const actions: ActionType[] = [];
    const toCall = this.state.lastRaiseTo - player.committed;
    const canCheck = toCall === 0;
    const canCall = toCall > 0 && toCall <= player.stack;
    const canBet = this.state.lastRaiseTo === 0 && player.stack > 0;
    const canRaise = toCall > 0 && player.stack > toCall;

    if (canCheck) actions.push(ActionType.CHECK);
    if (canCall) actions.push(ActionType.CALL);
    if (canBet) actions.push(ActionType.BET);
    if (canRaise) actions.push(ActionType.RAISE);
    actions.push(ActionType.FOLD);
    if (player.stack > 0) actions.push(ActionType.ALL_IN);

    return actions;
  }

  applyAction(actionType: ActionType, amount: number = 0): boolean {
    const seat = this.state.currentPlayer;
    const player = this.state.seats[seat];
    
    if (!player || !player.inHand) return false;
    
    const legalActions = this.getLegalActions(seat);
    if (!legalActions.includes(actionType)) return false;

    const action: Action = {
      seat,
      street: this.state.currentStreet,
      type: actionType,
      amount: this.calculateActionAmount(actionType, amount, player)
    };

    this.executeAction(action);
    this.state.actions.push(action);
    
    if (actionType === ActionType.FOLD) {
      player.inHand = false;
    } else {
      player.stack -= action.amount;
      player.committed += action.amount;
      this.state.pot += action.amount;
      
      if (actionType === ActionType.BET || actionType === ActionType.RAISE) {
        this.state.lastRaiseTo = player.committed;
      }
    }

    this.updateCurrentPlayer();
    this.checkStreetCompletion();
    
    return true;
  }

  private calculateActionAmount(actionType: ActionType, amount: number, player: Player): number {
    const toCall = this.state.lastRaiseTo - player.committed;
    
    switch (actionType) {
      case ActionType.FOLD:
      case ActionType.CHECK:
        return 0;
      case ActionType.CALL:
        return Math.min(toCall, player.stack);
      case ActionType.BET:
        return Math.min(Math.max(amount, this.bbSize), player.stack);
      case ActionType.RAISE:
        const minRaise = this.state.lastRaiseTo + this.bbSize;
        return Math.min(Math.max(amount, minRaise), player.stack);
      case ActionType.ALL_IN:
        return player.stack;
      default:
        return 0;
    }
  }

  private executeAction(action: Action): void {
    // Action execution logic is handled in applyAction
  }

  private updateCurrentPlayer(): void {
    const activePlayers = this.state.seats.filter(p => p.inHand);
    if (activePlayers.length <= 1) {
      this.state.isComplete = true;
      return;
    }

    do {
      this.state.currentPlayer = (this.state.currentPlayer + 1) % 6;
    } while (!this.state.seats[this.state.currentPlayer].inHand);
  }

  private checkStreetCompletion(): void {
    const activePlayers = this.state.seats.filter(p => p.inHand);
    if (activePlayers.length <= 1) {
      this.state.isComplete = true;
      return;
    }

    // Check if all active players have acted and betting is complete
    const allActed = activePlayers.every(p => 
      p.committed === this.state.lastRaiseTo || p.stack === 0
    );

    if (allActed) {
      this.advanceStreet();
    }
  }

  private advanceStreet(): void {
    switch (this.state.currentStreet) {
      case Street.PREFLOP:
        this.state.currentStreet = Street.FLOP;
        this.dealFlop();
        break;
      case Street.FLOP:
        this.state.currentStreet = Street.TURN;
        this.dealTurn();
        break;
      case Street.TURN:
        this.state.currentStreet = Street.RIVER;
        this.dealRiver();
        break;
      case Street.RIVER:
        this.state.isComplete = true;
        return;
    }

    // Reset betting for new street
    this.state.lastRaiseTo = 0;
    this.state.seats.forEach(p => p.committed = 0);
    this.updateCurrentPlayer();
  }

  private dealFlop(): void {
    const shuffledCards = this.shuffleArray([...CARDS]);
    const usedCards = Object.values(this.state.holeCards).flatMap(cards => cards.split(' '));
    const availableCards = shuffledCards.filter(card => !usedCards.includes(card));
    
    this.state.board.flop = `${availableCards[0]} ${availableCards[1]} ${availableCards[2]}`;
  }

  private dealTurn(): void {
    const shuffledCards = this.shuffleArray([...CARDS]);
    const usedCards = [
      ...Object.values(this.state.holeCards).flatMap(cards => cards.split(' ')),
      ...this.state.board.flop!.split(' ')
    ];
    const availableCards = shuffledCards.filter(card => !usedCards.includes(card));
    
    this.state.board.turn = availableCards[0];
  }

  private dealRiver(): void {
    const shuffledCards = this.shuffleArray([...CARDS]);
    const usedCards = [
      ...Object.values(this.state.holeCards).flatMap(cards => cards.split(' ')),
      ...this.state.board.flop!.split(' '),
      this.state.board.turn!
    ];
    const availableCards = shuffledCards.filter(card => !usedCards.includes(card));
    
    this.state.board.river = availableCards[0];
  }

  generateShortLine(): string {
    const actionSummary: string[] = [];
    
    for (const action of this.state.actions) {
      const playerName = `Seat${action.seat}`;
      switch (action.type) {
        case ActionType.FOLD:
          actionSummary.push(`${playerName}:fold`);
          break;
        case ActionType.CHECK:
          actionSummary.push(`${playerName}:check`);
          break;
        case ActionType.CALL:
          actionSummary.push(`${playerName}:call`);
          break;
        case ActionType.BET:
          actionSummary.push(`${playerName}:bet${action.amount}`);
          break;
        case ActionType.RAISE:
          actionSummary.push(`${playerName}:raise${action.amount}`);
          break;
        case ActionType.ALL_IN:
          actionSummary.push(`${playerName}:allin`);
          break;
      }
    }

    let boardStr = "";
    if (this.state.board.flop) {
      boardStr += `Flop:${this.state.board.flop}`;
    }
    if (this.state.board.turn) {
      boardStr += ` Turn:${this.state.board.turn}`;
    }
    if (this.state.board.river) {
      boardStr += ` River:${this.state.board.river}`;
    }

    return `${actionSummary.join(' ')} ${boardStr}`.trim();
  }

  getState(): GameState {
    return { ...this.state };
  }

  getCurrentPlayer(): Player | null {
    return this.state.seats[this.state.currentPlayer] || null;
  }

  isHandComplete(): boolean {
    return this.state.isComplete;
  }
}

