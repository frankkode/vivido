import { Chess } from 'chess.js';
import { Game, Player, GameState } from './types';
import { AIPlayer, AILevel } from './AIPlayer';
import { generateGameId } from './utils/generateGameId';

export class GameManager {
  private games: Map<string, Game> = new Map();
  private chessInstances: Map<string, Chess> = new Map();
  private aiPlayers: Map<string, AIPlayer> = new Map();
  private waitingPlayers: Array<{ id: string; name: string }> = [];

  createGame(): string {
    // Generate unique short game ID
    let gameId: string;
    do {
      gameId = generateGameId();
    } while (this.games.has(gameId)); // Ensure uniqueness
    const chess = new Chess();

    const game: Game = {
      id: gameId,
      players: [],
      spectators: new Set(),
      fen: chess.fen(),
      turn: 'w',
      moveHistory: [],
      status: 'waiting',
      createdAt: new Date(),
    };

    this.games.set(gameId, game);
    this.chessInstances.set(gameId, chess);

    return gameId;
  }

  joinGame(gameId: string, playerId: string, playerName: string): Player | null {
    const game = this.games.get(gameId);
    if (!game || game.players.length >= 2) {
      return null;
    }

    const color = game.players.length === 0 ? 'w' : 'b';
    const player: Player = { id: playerId, name: playerName, color };

    game.players.push(player);

    if (game.players.length === 2) {
      game.status = 'active';
    }

    return player;
  }

  joinAsSpectator(gameId: string, spectatorId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;

    game.spectators.add(spectatorId);
    return true;
  }

  leaveGame(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.spectators.delete(playerId);

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1 && game.status === 'active') {
      // If a player leaves during an active game, the other player wins
      game.status = 'finished';
      const winner = game.players[1 - playerIndex];
      game.result = winner.color === 'w' ? 'white' : 'black';
    }
  }

  makeMove(gameId: string, playerId: string, from: string, to: string, promotion?: string): boolean {
    const game = this.games.get(gameId);
    const chess = this.chessInstances.get(gameId);

    if (!game || !chess || game.status !== 'active') {
      return false;
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player || player.color !== game.turn) {
      return false;
    }

    try {
      const move = chess.move({ from, to, promotion });
      if (!move) return false;

      game.fen = chess.fen();
      game.turn = chess.turn();
      game.moveHistory.push(move.san);

      if (chess.isGameOver()) {
        game.status = 'finished';
        if (chess.isCheckmate()) {
          game.result = chess.turn() === 'w' ? 'black' : 'white';
        } else {
          game.result = 'draw';
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  getGameState(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    return {
      id: game.id,
      fen: game.fen,
      turn: game.turn,
      moveHistory: game.moveHistory,
      status: game.status,
      players: game.players,
      spectatorCount: game.spectators.size,
    };
  }

  getAllActiveGames(): GameState[] {
    return Array.from(this.games.values())
      .filter(game => game.status === 'active' || game.status === 'waiting')
      .map(game => ({
        id: game.id,
        fen: game.fen,
        turn: game.turn,
        moveHistory: game.moveHistory,
        status: game.status,
        players: game.players,
        spectatorCount: game.spectators.size,
      }));
  }

  addWaitingPlayer(playerId: string, playerName: string): string | null {
    // Check if there's already a waiting player
    if (this.waitingPlayers.length > 0) {
      const opponent = this.waitingPlayers.shift()!;
      const gameId = this.createGame();

      this.joinGame(gameId, opponent.id, opponent.name);
      this.joinGame(gameId, playerId, playerName);

      return gameId;
    } else {
      this.waitingPlayers.push({ id: playerId, name: playerName });
      return null;
    }
  }

  removeWaitingPlayer(playerId: string): void {
    this.waitingPlayers = this.waitingPlayers.filter(p => p.id !== playerId);
  }

  /**
   * Create a new AI game
   */
  createAIGame(playerId: string, playerName: string, aiLevel: AILevel): string {
    const gameId = this.createGame();
    const chess = this.chessInstances.get(gameId)!;
    const game = this.games.get(gameId)!;

    // Randomly assign colors
    const playerColor = Math.random() < 0.5 ? 'w' : 'b';
    const aiColor = playerColor === 'w' ? 'b' : 'w';

    // Add human player
    const humanPlayer: Player = {
      id: playerId,
      name: playerName || 'Player',
      color: playerColor,
      isAI: false,
    };

    // Add AI player
    const aiPlayer: Player = {
      id: `ai-${gameId}`,
      name: `AI (${AIPlayer.getLevelName(aiLevel)})`,
      color: aiColor,
      isAI: true,
      aiLevel,
    };

    game.players = [humanPlayer, aiPlayer];
    game.status = 'active';
    game.isAIGame = true;

    // Create AI instance
    this.aiPlayers.set(gameId, new AIPlayer(aiLevel));

    return gameId;
  }

  /**
   * Get AI move for a game
   */
  async getAIMove(gameId: string): Promise<{ from: string; to: string; promotion?: string } | null> {
    const game = this.games.get(gameId);
    const ai = this.aiPlayers.get(gameId);

    if (!game || !ai || !game.isAIGame) {
      return null;
    }

    // Check if it's AI's turn
    const aiPlayer = game.players.find(p => p.isAI);
    if (!aiPlayer || aiPlayer.color !== game.turn) {
      return null;
    }

    return await ai.getBestMove(game.fen);
  }

  /**
   * Check if a game is an AI game
   */
  isAIGame(gameId: string): boolean {
    const game = this.games.get(gameId);
    return game?.isAIGame ?? false;
  }

  /**
   * Get AI player for a game
   */
  getAIPlayer(gameId: string): Player | null {
    const game = this.games.get(gameId);
    if (!game) return null;
    return game.players.find(p => p.isAI) ?? null;
  }
}
