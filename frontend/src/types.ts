export interface Player {
  id: string;
  name: string;
  color: 'w' | 'b';
  isAI?: boolean;
  aiLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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

export type AILevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type GameMode = 'menu' | 'ai-select' | 'matchmaking' | 'playing' | 'spectating';
