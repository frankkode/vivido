import { Chess } from 'chess.js';

export type AILevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface AIConfig {
  depth: number;
  skillLevel: number;
  thinkTime: number; // milliseconds
}

const AI_CONFIGS: Record<AILevel, AIConfig> = {
  beginner: { depth: 1, skillLevel: 2, thinkTime: 500 },
  intermediate: { depth: 3, skillLevel: 8, thinkTime: 800 },
  advanced: { depth: 5, skillLevel: 15, thinkTime: 1200 },
  expert: { depth: 8, skillLevel: 20, thinkTime: 1500 },
};

export class AIPlayer {
  private level: AILevel;
  private config: AIConfig;

  constructor(level: AILevel = 'intermediate') {
    this.level = level;
    this.config = AI_CONFIGS[level];
  }

  /**
   * Get the best move for the current position
   * Uses minimax algorithm with alpha-beta pruning
   */
  async getBestMove(fen: string): Promise<{ from: string; to: string; promotion?: string } | null> {
    const chess = new Chess(fen);

    // Get legal moves
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;

    // For beginner level, sometimes make random moves
    if (this.level === 'beginner' && Math.random() < 0.3) {
      await this.delay(this.config.thinkTime);
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
      };
    }

    // Start minimax calculation with timeout protection
    const startTime = Date.now();
    const maxCalculationTime = 5000; // 5 seconds max

    try {
      // Use async minimax to prevent blocking
      const bestMove = await this.minimaxAsync(chess, this.config.depth, -Infinity, Infinity, true, maxCalculationTime);

      const calculationTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, this.config.thinkTime - calculationTime);
      await this.delay(remainingDelay);

      if (!bestMove.move) {
        // Fallback to random move
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return {
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion,
        };
      }

      return bestMove.move;
    } catch (error) {
      // Timeout or error - return random move
      console.warn('AI calculation timeout or error, using random move:', error);
      await this.delay(this.config.thinkTime);
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
      };
    }
  }

  /**
   * Async minimax algorithm with alpha-beta pruning that doesn't block the event loop
   */
  private async minimaxAsync(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
    maxTime: number,
    startTime: number = Date.now(),
    moveCount: number = 0
  ): Promise<{ score: number; move: { from: string; to: string; promotion?: string } | null }> {
    // Check timeout
    if (Date.now() - startTime > maxTime) {
      throw new Error('Calculation timeout');
    }

    // Yield to event loop every 100 moves to prevent blocking
    if (moveCount % 100 === 0 && moveCount > 0) {
      await new Promise(resolve => setImmediate(resolve));
    }

    if (depth === 0 || chess.isGameOver()) {
      return { score: this.evaluatePosition(chess), move: null };
    }

    const moves = chess.moves({ verbose: true });
    let bestMove = null;

    if (maximizingPlayer) {
      let maxScore = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const result = await this.minimaxAsync(chess, depth - 1, alpha, beta, false, maxTime, startTime, moveCount + 1);
        chess.undo();

        if (result.score > maxScore) {
          maxScore = result.score;
          bestMove = { from: move.from, to: move.to, promotion: move.promotion };
        }

        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        chess.move(move);
        const result = await this.minimaxAsync(chess, depth - 1, alpha, beta, true, maxTime, startTime, moveCount + 1);
        chess.undo();

        if (result.score < minScore) {
          minScore = result.score;
          bestMove = { from: move.from, to: move.to, promotion: move.promotion };
        }

        beta = Math.min(beta, result.score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return { score: minScore, move: bestMove };
    }
  }

  /**
   * Minimax algorithm with alpha-beta pruning (kept for reference, not used)
   */
  private minimax(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): { score: number; move: { from: string; to: string; promotion?: string } | null } {
    if (depth === 0 || chess.isGameOver()) {
      return { score: this.evaluatePosition(chess), move: null };
    }

    const moves = chess.moves({ verbose: true });
    let bestMove = null;

    if (maximizingPlayer) {
      let maxScore = -Infinity;
      for (const move of moves) {
        chess.move(move);
        const score = this.minimax(chess, depth - 1, alpha, beta, false).score;
        chess.undo();

        if (score > maxScore) {
          maxScore = score;
          bestMove = { from: move.from, to: move.to, promotion: move.promotion };
        }

        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;
      for (const move of moves) {
        chess.move(move);
        const score = this.minimax(chess, depth - 1, alpha, beta, true).score;
        chess.undo();

        if (score < minScore) {
          minScore = score;
          bestMove = { from: move.from, to: move.to, promotion: move.promotion };
        }

        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return { score: minScore, move: bestMove };
    }
  }

  /**
   * Evaluate the current position
   * Positive score favors the current player
   */
  private evaluatePosition(chess: Chess): number {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -10000 : 10000;
    }

    if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
      return 0;
    }

    let score = 0;
    const board = chess.board();

    // Piece values
    const pieceValues: Record<string, number> = {
      p: 100,
      n: 320,
      b: 330,
      r: 500,
      q: 900,
      k: 20000,
    };

    // Position bonus for different pieces
    const pawnTable = [
      0, 0, 0, 0, 0, 0, 0, 0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
      5, 5, 10, 25, 25, 10, 5, 5,
      0, 0, 0, 20, 20, 0, 0, 0,
      5, -5, -10, 0, 0, -10, -5, 5,
      5, 10, 10, -20, -20, 10, 10, 5,
      0, 0, 0, 0, 0, 0, 0, 0,
    ];

    const knightTable = [
      -50, -40, -30, -30, -30, -30, -40, -50,
      -40, -20, 0, 0, 0, 0, -20, -40,
      -30, 0, 10, 15, 15, 10, 0, -30,
      -30, 5, 15, 20, 20, 15, 5, -30,
      -30, 0, 15, 20, 20, 15, 0, -30,
      -30, 5, 10, 15, 15, 10, 5, -30,
      -40, -20, 0, 5, 5, 0, -20, -40,
      -50, -40, -30, -30, -30, -30, -40, -50,
    ];

    // Evaluate material and position
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          const position = row * 8 + col;

          let positionBonus = 0;
          if (piece.type === 'p') {
            positionBonus = piece.color === 'w'
              ? pawnTable[position]
              : pawnTable[63 - position];
          } else if (piece.type === 'n') {
            positionBonus = piece.color === 'w'
              ? knightTable[position]
              : knightTable[63 - position];
          }

          const totalValue = value + positionBonus;
          score += piece.color === 'w' ? totalValue : -totalValue;
        }
      }
    }

    // Adjust score based on current turn
    return chess.turn() === 'w' ? score : -score;
  }

  /**
   * Delay helper for simulating thinking time
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get AI level information
   */
  getLevel(): AILevel {
    return this.level;
  }

  /**
   * Get level display name
   */
  static getLevelName(level: AILevel): string {
    const names = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return names[level];
  }

  /**
   * Get level description
   */
  static getLevelDescription(level: AILevel): string {
    const descriptions = {
      beginner: 'Perfect for learning the game',
      intermediate: 'Good challenge for casual players',
      advanced: 'Strong opponent for experienced players',
      expert: 'Master level difficulty',
    };
    return descriptions[level];
  }
}
