import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { GameManager } from './GameManager';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const gameManager = new GameManager();

app.use(cors());
app.use(express.json());

// Serve static files from frontend build in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
console.log('Frontend dist path:', frontendDistPath);
console.log('Frontend dist exists:', existsSync(frontendDistPath));

if (existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
} else {
  console.warn('Frontend dist directory not found at:', frontendDistPath);
}

// REST API endpoints
app.get('/api/games', (req, res) => {
  const games = gameManager.getAllActiveGames();
  res.json(games);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('findMatch', (playerName: string) => {
    const gameId = gameManager.addWaitingPlayer(socket.id, playerName || 'Anonymous');

    if (gameId) {
      const game = gameManager.getGameState(gameId);
      if (game) {
        // Both players found, notify them
        game.players.forEach(player => {
          io.to(player.id).emit('matchFound', {
            gameId,
            color: player.color,
            playerName: player.name,
            gameState: game,
          });
        });

        // Join socket room
        game.players.forEach(player => {
          io.sockets.sockets.get(player.id)?.join(gameId);
        });
      }
    } else {
      socket.emit('waitingForOpponent');
    }
  });

  socket.on('cancelMatchmaking', () => {
    gameManager.removeWaitingPlayer(socket.id);
  });

  socket.on('createGame', (playerName: string) => {
    const gameId = gameManager.createGame();
    const player = gameManager.joinGame(gameId, socket.id, playerName || 'Anonymous');

    if (player) {
      socket.join(gameId);
      socket.emit('gameCreated', {
        gameId,
        color: player.color,
        playerName: player.name,
      });
    }
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    const player = gameManager.joinGame(gameId, socket.id, playerName || 'Anonymous');

    if (player) {
      socket.join(gameId);
      const gameState = gameManager.getGameState(gameId);

      socket.emit('gameJoined', {
        gameId,
        color: player.color,
        playerName: player.name,
        gameState,
      });

      // Notify all players in the game
      io.to(gameId).emit('gameUpdate', gameState);
    } else {
      socket.emit('error', { message: 'Could not join game' });
    }
  });

  socket.on('spectateGame', ({ gameId, spectatorName }) => {
    const success = gameManager.joinAsSpectator(gameId, socket.id);

    if (success) {
      socket.join(gameId);
      const gameState = gameManager.getGameState(gameId);

      socket.emit('spectatingGame', {
        gameId,
        spectatorName: spectatorName || 'Anonymous',
        gameState,
      });

      // Notify players about new spectator
      io.to(gameId).emit('gameUpdate', gameState);
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('makeMove', ({ gameId, from, to, promotion }) => {
    const success = gameManager.makeMove(gameId, socket.id, from, to, promotion);

    if (success) {
      const gameState = gameManager.getGameState(gameId);
      // Broadcast to all players and spectators in the game
      io.to(gameId).emit('gameUpdate', gameState);

      if (gameState?.status === 'finished') {
        io.to(gameId).emit('gameOver', {
          result: gameState.result,
          gameState,
        });
      }
    } else {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  socket.on('getGameState', (gameId: string) => {
    const gameState = gameManager.getGameState(gameId);
    if (gameState) {
      socket.emit('gameUpdate', gameState);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Handle player leaving - this will be managed by room cleanup
  });
});

// Serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({
      message: 'Backend server is running',
      note: 'Frontend build not found. Please build frontend first.',
      frontendPath: frontendDistPath
    });
  }
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
