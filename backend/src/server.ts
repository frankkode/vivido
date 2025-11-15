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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (MUST be before static files)
app.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.status(200).send('OK');
});

// Serve static files from frontend build in production
console.log('=== BACKEND VERSION 2.0 - Updated logging ===');
console.log('__dirname is:', __dirname);

// Try multiple possible locations for the frontend build
const possiblePaths = [
  path.join(__dirname, 'public'),           // Copied during build (production)
  path.join(__dirname, '../../frontend/dist') // Original location (development)
];

console.log('Checking paths for frontend files:', possiblePaths);

let frontendDistPath = '';
for (const p of possiblePaths) {
  console.log(`Checking ${p}:`, existsSync(p));
  if (existsSync(p)) {
    frontendDistPath = p;
    console.log('Frontend dist found at:', frontendDistPath);
    break;
  }
}

if (frontendDistPath) {
  console.log('Serving static files from:', frontendDistPath);
  app.use(express.static(frontendDistPath));
} else {
  console.error('ERROR: Frontend dist directory not found!');
  console.error('Tried paths:', possiblePaths);
}

// REST API endpoints
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ status: 'Server is responding', timestamp: new Date().toISOString() });
});

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
      const gameState = gameManager.getGameState(gameId);
      socket.emit('gameCreated', {
        gameId,
        color: player.color,
        playerName: player.name,
        gameState,
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

  socket.on('makeMove', async ({ gameId, from, to, promotion }) => {
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
        return;
      }

      // If this is an AI game, trigger AI move
      if (gameManager.isAIGame(gameId)) {
        console.log('AI game detected, triggering AI move...');
        // Small delay for better UX
        setTimeout(async () => {
          const aiMove = await gameManager.getAIMove(gameId);
          console.log('AI move calculated:', aiMove);
          if (aiMove) {
            const aiPlayer = gameManager.getAIPlayer(gameId);
            if (aiPlayer) {
              const aiSuccess = gameManager.makeMove(
                gameId,
                aiPlayer.id,
                aiMove.from,
                aiMove.to,
                aiMove.promotion
              );

              console.log('AI move success:', aiSuccess);
              if (aiSuccess) {
                const updatedState = gameManager.getGameState(gameId);
                io.to(gameId).emit('gameUpdate', updatedState);

                if (updatedState?.status === 'finished') {
                  io.to(gameId).emit('gameOver', {
                    result: updatedState.result,
                    gameState: updatedState,
                  });
                }
              }
            }
          }
        }, 300);
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

  // AI Game handlers
  socket.on('createAIGame', async ({ playerName, aiLevel }) => {
    console.log(`Creating AI game for ${playerName} vs AI (${aiLevel})`);

    const gameId = gameManager.createAIGame(
      socket.id,
      playerName || 'Player',
      aiLevel || 'intermediate'
    );

    const gameState = gameManager.getGameState(gameId);
    const humanPlayer = gameState?.players.find(p => !p.isAI);

    console.log('AI Game created:', {
      gameId,
      humanColor: humanPlayer?.color,
      aiColor: gameState?.players.find(p => p.isAI)?.color,
      currentTurn: gameState?.turn
    });

    if (gameState && humanPlayer) {
      socket.join(gameId);
      socket.emit('aiGameCreated', {
        gameId,
        color: humanPlayer.color,
        playerName: humanPlayer.name,
        gameState,
      });

      // If AI plays white, make first move
      if (humanPlayer.color === 'b') {
        // AI is white and should play first
        setTimeout(async () => {
          const aiMove = await gameManager.getAIMove(gameId);
          if (aiMove) {
            const aiPlayer = gameManager.getAIPlayer(gameId);
            if (aiPlayer) {
              const success = gameManager.makeMove(
                gameId,
                aiPlayer.id,
                aiMove.from,
                aiMove.to,
                aiMove.promotion
              );

              if (success) {
                const updatedState = gameManager.getGameState(gameId);
                io.to(gameId).emit('gameUpdate', updatedState);
              }
            }
          }
        }, 500);
      }
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

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);
console.log('Binding to HOST:', HOST);

httpServer.listen(PORT, HOST, () => {
  console.log(`✓ Server successfully started on ${HOST}:${PORT}`);
  console.log(`✓ Ready to accept connections`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
