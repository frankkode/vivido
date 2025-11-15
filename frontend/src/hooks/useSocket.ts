import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setMode, setPlayerColor, setGameId, setGameState } = useGameStore();

  useEffect(() => {
    // Use current host in production, localhost in development
    const socketUrl = import.meta.env.PROD
      ? window.location.origin
      : 'http://localhost:3001';

    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('waitingForOpponent', () => {
      console.log('Waiting for opponent...');
    });

    socket.on('matchFound', ({ gameId, color, gameState }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setGameState(gameState);
      setMode('playing');
    });

    socket.on('gameCreated', ({ gameId, color, gameState }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setGameState(gameState);
      setMode('playing');
    });

    socket.on('aiGameCreated', ({ gameId, color, gameState }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setGameState(gameState);
      setMode('playing');
    });

    socket.on('gameJoined', ({ gameId, color, gameState }) => {
      setGameId(gameId);
      setPlayerColor(color);
      setGameState(gameState);
      setMode('playing');
    });

    socket.on('spectatingGame', ({ gameId, gameState }) => {
      setGameId(gameId);
      setGameState(gameState);
      setMode('spectating');
    });

    socket.on('gameUpdate', (gameState) => {
      setGameState(gameState);
    });

    socket.on('gameOver', ({ result, gameState }) => {
      setGameState(gameState);
      alert(`Game Over! Result: ${result}`);
    });

    socket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      alert(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [setMode, setPlayerColor, setGameId, setGameState]);

  return socketRef.current;
};
