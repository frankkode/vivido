import { create } from 'zustand';
import { GameState, GameMode } from '../types';

interface GameStore {
  mode: GameMode;
  playerName: string;
  playerColor: 'w' | 'b' | null;
  gameId: string | null;
  gameState: GameState | null;
  availableGames: GameState[];

  setMode: (mode: GameMode) => void;
  setPlayerName: (name: string) => void;
  setPlayerColor: (color: 'w' | 'b' | null) => void;
  setGameId: (id: string | null) => void;
  setGameState: (state: GameState | null) => void;
  setAvailableGames: (games: GameState[]) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  mode: 'menu',
  playerName: '',
  playerColor: null,
  gameId: null,
  gameState: null,
  availableGames: [],

  setMode: (mode) => set({ mode }),
  setPlayerName: (name) => set({ playerName: name }),
  setPlayerColor: (color) => set({ playerColor: color }),
  setGameId: (id) => set({ gameId: id }),
  setGameState: (state) => set({ gameState: state }),
  setAvailableGames: (games) => set({ availableGames: games }),
  reset: () => set({
    mode: 'menu',
    playerColor: null,
    gameId: null,
    gameState: null,
  }),
}));
