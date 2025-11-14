import { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

interface MatchmakingProps {
  socket: Socket | null;
}

export const Matchmaking = ({ socket }: MatchmakingProps) => {
  const { setMode } = useGameStore();

  const handleCancel = () => {
    socket?.emit('cancelMatchmaking');
    setMode('menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20 text-center">
        <div className="mb-6">
          <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
          <h2 className="text-3xl font-bold text-white mb-2">Finding Opponent...</h2>
          <p className="text-white/70">Please wait while we match you with another player</p>
        </div>

        <div className="flex gap-2 justify-center mb-6">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        <button
          onClick={handleCancel}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
