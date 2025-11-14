import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

interface ChessGameProps {
  socket: Socket | null;
  isSpectator?: boolean;
}

export const ChessGame = ({ socket, isSpectator = false }: ChessGameProps) => {
  const { gameState, gameId, playerColor, playerName, setMode, reset } = useGameStore();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  if (!gameState) {
    return <div className="text-white">Loading game...</div>;
  }

  const chess = new Chess(gameState.fen);
  const isPlayerTurn = !isSpectator && gameState.turn === playerColor;

  const handleSquareClick = (square: string) => {
    if (isSpectator || !isPlayerTurn) return;

    if (selectedSquare) {
      // Try to make a move
      const piece = chess.get(selectedSquare);
      const isPromotion = piece?.type === 'p' &&
        ((piece.color === 'w' && square[1] === '8') ||
         (piece.color === 'b' && square[1] === '1'));

      socket?.emit('makeMove', {
        gameId,
        from: selectedSquare,
        to: square,
        promotion: isPromotion ? 'q' : undefined,
      });

      setSelectedSquare(null);
    } else {
      // Select a square
      const piece = chess.get(square);
      if (piece && piece.color === playerColor) {
        setSelectedSquare(square);
      }
    }
  };

  const handleLeave = () => {
    reset();
    setMode('menu');
  };

  const getStatusMessage = () => {
    if (gameState.status === 'waiting') {
      return 'Waiting for opponent...';
    }
    if (gameState.status === 'finished') {
      if (gameState.result === 'draw') {
        return 'Game Over - Draw!';
      }
      const winner = gameState.result === 'white' ? 'White' : 'Black';
      return `Game Over - ${winner} wins!`;
    }
    if (isSpectator) {
      return `${gameState.turn === 'w' ? 'White' : 'Black'} to move`;
    }
    return isPlayerTurn ? 'Your turn!' : "Opponent's turn";
  };

  const whitePlayer = gameState.players.find(p => p.color === 'w');
  const blackPlayer = gameState.players.find(p => p.color === 'b');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Vivido Chess</h2>
              <p className="text-white/60 text-sm">Game ID: {gameId}</p>
            </div>
            <button
              onClick={handleLeave}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Leave Game
            </button>
          </div>

          {/* Players Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚪</span>
                <div>
                  <p className="text-white font-semibold">{whitePlayer?.name || 'Waiting...'}</p>
                  <p className="text-white/60 text-sm">White</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚫</span>
                <div>
                  <p className="text-white font-semibold">{blackPlayer?.name || 'Waiting...'}</p>
                  <p className="text-white/60 text-sm">Black</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/10 rounded-lg p-4 mb-4 text-center">
            <p className="text-white text-lg font-semibold">{getStatusMessage()}</p>
            {isSpectator && (
              <p className="text-white/60 text-sm mt-1">
                👁️ Spectator Mode | {gameState.spectatorCount} watching
              </p>
            )}
            {!isSpectator && (
              <p className="text-white/60 text-sm mt-1">
                You are playing as {playerColor === 'w' ? 'White ⚪' : 'Black ⚫'}
              </p>
            )}
          </div>

          {/* Chess Board */}
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <Chessboard
              position={gameState.fen}
              onSquareClick={handleSquareClick}
              boardOrientation={isSpectator ? 'white' : playerColor === 'w' ? 'white' : 'black'}
              customSquareStyles={{
                ...(selectedSquare ? {
                  [selectedSquare]: {
                    backgroundColor: 'rgba(255, 255, 0, 0.4)',
                  },
                } : {}),
              }}
              arePiecesDraggable={false}
            />
          </div>

          {/* Move History */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">Move History</h3>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {gameState.moveHistory.length === 0 ? (
                <p className="text-white/60 text-sm">No moves yet</p>
              ) : (
                gameState.moveHistory.map((move, index) => (
                  <span
                    key={index}
                    className="bg-white/10 px-2 py-1 rounded text-white text-sm"
                  >
                    {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : '..'} {move}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
