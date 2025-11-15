import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { AILevel } from '../types';

interface AIDifficultySelectProps {
  socket: Socket | null;
}

interface DifficultyOption {
  level: AILevel;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

const difficulties: DifficultyOption[] = [
  {
    level: 'beginner',
    name: 'Beginner',
    description: 'Perfect for learning the game',
    icon: '🌱',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
  },
  {
    level: 'intermediate',
    name: 'Intermediate',
    description: 'Good challenge for casual players',
    icon: '🎯',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
  },
  {
    level: 'advanced',
    name: 'Advanced',
    description: 'Strong opponent for experienced players',
    icon: '⚡',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700',
  },
  {
    level: 'expert',
    name: 'Expert',
    description: 'Master level difficulty',
    icon: '👑',
    color: 'red',
    gradient: 'from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700',
  },
];

export const AIDifficultySelect = ({ socket }: AIDifficultySelectProps) => {
  const { playerName, setMode } = useGameStore();
  const [selectedLevel, setSelectedLevel] = useState<AILevel>('intermediate');

  const handleStartGame = () => {
    if (!socket || !playerName.trim()) {
      alert('Please enter your name from the main menu');
      setMode('menu');
      return;
    }
    socket.emit('createAIGame', { playerName, aiLevel: selectedLevel });
  };

  const handleBack = () => {
    setMode('menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          🤖 Play vs AI
        </h1>
        <p className="text-white/70 text-center mb-8">Choose your difficulty level</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {difficulties.map((diff) => (
            <button
              key={diff.level}
              onClick={() => setSelectedLevel(diff.level)}
              className={`
                p-6 rounded-xl border-2 transition-all transform
                ${
                  selectedLevel === diff.level
                    ? 'border-white bg-white/20 scale-105 shadow-2xl'
                    : 'border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50'
                }
              `}
            >
              <div className="text-5xl mb-3">{diff.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{diff.name}</h3>
              <p className="text-white/70 text-sm">{diff.description}</p>
            </button>
          ))}
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/20">
          <p className="text-white/90 text-sm">
            <span className="font-bold">Selected:</span>{' '}
            {difficulties.find((d) => d.level === selectedLevel)?.name}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {difficulties.find((d) => d.level === selectedLevel)?.description}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg border border-white/30 transition hover:scale-105"
          >
            ← Back
          </button>
          <button
            onClick={handleStartGame}
            className={`
              flex-1 bg-gradient-to-r ${difficulties.find((d) => d.level === selectedLevel)?.gradient}
              text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105
            `}
          >
            Start Game 🎮
          </button>
        </div>

        <div className="mt-6 text-center text-white/60 text-sm">
          <p>🎯 Challenge yourself against AI opponents!</p>
        </div>
      </div>
    </div>
  );
};
