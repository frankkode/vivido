export interface Player {
  id: string;
  name: string;
  color: 'w' | 'b';
}

export interface GameState {
  id: string;
  fen: string;
  turn: 'w' | 'b';
  moveHistory: string[];
  status: string;
  players: Player[];
  spectatorCount: number;
  result?: 'white' | 'black' | 'draw';
}

export type GameMode = 'menu' | 'matchmaking' | 'playing' | 'spectating';
