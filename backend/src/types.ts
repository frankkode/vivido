export interface Player {
  id: string;
  name: string;
  color: 'w' | 'b';
  isAI?: boolean;
  aiLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Game {
  id: string;
  players: Player[];
  spectators: Set<string>;
  fen: string;
  turn: 'w' | 'b';
  moveHistory: string[];
  status: 'waiting' | 'active' | 'finished';
  result?: 'white' | 'black' | 'draw';
  createdAt: Date;
  isAIGame?: boolean;
}

export interface GameState {
  id: string;
  fen: string;
  turn: 'w' | 'b';
  moveHistory: string[];
  status: string;
  result?: 'white' | 'black' | 'draw';
  players: Player[];
  spectatorCount: number;
}
