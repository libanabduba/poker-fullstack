export interface Player {
  seat: number;
  name: string;
  stack: number;
  role: string; // BTN, SB, BB, UTG, MP, CO
  inHand: boolean;
  committed: number;
}

export interface Action {
  seat: number;
  street: string;
  type: string; // f, x, c, b, r, allin
  amount: number;
}

export interface Board {
  flop?: string;
  turn?: string;
  river?: string;
}

export interface GameState {
  seats: Player[];
  currentStreet: Street;
  pot: number;
  lastRaiseTo: number;
  currentPlayer: number;
  board: Board;
  holeCards: Record<number, string>;
  actions: Action[];
  shortLine: string;
  isComplete: boolean;
}

export enum Street {
  PREFLOP = "preflop",
  FLOP = "flop",
  TURN = "turn",
  RIVER = "river"
}

export enum ActionType {
  FOLD = "f",
  CHECK = "x",
  CALL = "c",
  BET = "b",
  RAISE = "r",
  ALL_IN = "allin"
}

export const ROLES = ["BTN", "SB", "BB", "UTG", "MP", "CO"] as const;
export const CARDS = [
  "As", "Ah", "Ad", "Ac", "Ks", "Kh", "Kd", "Kc", "Qs", "Qh", "Qd", "Qc",
  "Js", "Jh", "Jd", "Jc", "Ts", "Th", "Td", "Tc", "9s", "9h", "9d", "9c",
  "8s", "8h", "8d", "8c", "7s", "7h", "7d", "7c", "6s", "6h", "6d", "6c",
  "5s", "5h", "5d", "5c", "4s", "4h", "4d", "4c", "3s", "3h", "3d", "3c",
  "2s", "2h", "2d", "2c"
] as const;

