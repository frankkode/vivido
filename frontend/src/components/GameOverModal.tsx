import { GameState } from '../types';

interface GameOverModalProps {
  gameState: GameState;
  playerColor: 'w' | 'b' | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal = ({ gameState, playerColor, onPlayAgain, onBackToMenu }: GameOverModalProps) => {
  if (gameState.status !== 'finished') return null;

  const getResult = () => {
    if (gameState.result === 'draw') {
      return {
        title: "It's a Draw!",
        icon: '🤝',
        color: 'from-gray-500 to-gray-600',
        message: 'Well played by both sides!'
      };
    }

    const wonGame = (playerColor === 'w' && gameState.result === 'white') ||
                    (playerColor === 'b' && gameState.result === 'black');
    const opponent = gameState.players.find(p => p.color !== playerColor);
    const isAIGame = opponent?.isAI;

    if (wonGame) {
      return {
        title: '🎉 Victory!',
        icon: '👑',
        color: 'from-green-500 to-emerald-600',
        message: isAIGame ? `You defeated ${opponent?.name}!` : 'Congratulations on your win!'
      };
    } else {
      return {
        title: 'Defeat',
        icon: '😔',
        color: 'from-red-500 to-orange-600',
        message: isAIGame ? `${opponent?.name} wins!` : 'Better luck next time!'
      };
    }
  };

  const result = getResult();
  const moveCount = gameState.moveHistory.length;
  const halfMoves = Math.ceil(moveCount / 2);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-white/20 animate-fade-in">
        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4 animate-bounce">{result.icon}</div>
          <h2 className={`text-4xl font-bold bg-gradient-to-r ${result.color} text-transparent bg-clip-text mb-2`}>
            {result.title}
          </h2>
          <p className="text-white/80 text-lg">{result.message}</p>
        </div>

        {/* Game Stats */}
        <div className="bg-white/10 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-white/90">
            <span>Total Moves:</span>
            <span className="font-bold">{halfMoves}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Result:</span>
            <span className="font-bold capitalize">
              {gameState.result === 'draw' ? 'Draw' : `${gameState.result} wins`}
            </span>
          </div>
          {gameState.players.map((player, idx) => (
            <div key={idx} className="flex justify-between text-white/90">
              <span>{player.color === 'w' ? '⚪' : '⚫'} {player.name}</span>
              <span className="font-bold">
                {((player.color === 'w' && gameState.result === 'white') ||
                  (player.color === 'b' && gameState.result === 'black')) ? '✓' :
                  gameState.result === 'draw' ? '=' : '✗'}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            🔄 Play Again
          </button>
          <button
            onClick={onBackToMenu}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg border border-white/30 transition hover:scale-105"
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
