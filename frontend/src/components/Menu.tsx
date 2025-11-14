import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

interface MenuProps {
  socket: Socket | null;
}

export const Menu = ({ socket }: MenuProps) => {
  const [name, setName] = useState('');
  const [gameIdInput, setGameIdInput] = useState('');
  const { setPlayerName, setMode } = useGameStore();

  const handleFindMatch = () => {
    if (!socket || !name.trim()) {
      alert('Please enter your name');
      return;
    }
    setPlayerName(name);
    socket.emit('findMatch', name);
    setMode('matchmaking');
  };

  const handleCreateGame = () => {
    if (!socket || !name.trim()) {
      alert('Please enter your name');
      return;
    }
    setPlayerName(name);
    socket.emit('createGame', name);
  };

  const handleJoinGame = () => {
    if (!socket || !name.trim() || !gameIdInput.trim()) {
      alert('Please enter your name and game ID');
      return;
    }
    setPlayerName(name);
    socket.emit('joinGame', { gameId: gameIdInput, playerName: name });
  };

  const handleSpectate = () => {
    if (!socket || !gameIdInput.trim()) {
      alert('Please enter a game ID to spectate');
      return;
    }
    socket.emit('spectateGame', { gameId: gameIdInput, spectatorName: name || 'Anonymous' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-5xl font-bold text-white text-center mb-2">
          ♔ Vivido Chess ♚
        </h1>
        <p className="text-white/70 text-center mb-8">Play with your family on any device</p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleFindMatch}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            🎮 Find Match
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Game ID"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleJoinGame}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Join
            </button>
          </div>

          <button
            onClick={handleCreateGame}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            ➕ Create Private Game
          </button>

          <button
            onClick={handleSpectate}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            👁️ Spectate Game
          </button>
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>Share the Game ID with family to play together!</p>
        </div>
      </div>
    </div>
  );
};
