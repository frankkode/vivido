# ♔ Vivido Chess ♚

A real-time multiplayer chess game that can be streamed and played by the whole family on any device!

## Features

- **Real-time Multiplayer**: Play chess with family and friends in real-time
- **Matchmaking**: Automatically find opponents or create private games
- **Spectator Mode**: Watch live games in progress (streaming)
- **Cross-Device**: Works on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern, responsive design with gradient backgrounds
- **Move History**: Track all moves in the game
- **Game Sharing**: Share game IDs to invite specific people

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Socket.io Client for real-time communication
- react-chessboard for the chess board UI
- chess.js for move validation
- Zustand for state management

### Backend
- Node.js with Express
- Socket.io for WebSocket connections
- chess.js for server-side game logic
- TypeScript

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vivido
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### Running the Application

#### Development Mode (Both servers)
```bash
npm run dev
```

This starts both the backend server (port 3001) and frontend dev server (port 3000).

#### Run Backend Only
```bash
npm run dev:backend
```

#### Run Frontend Only
```bash
npm run dev:frontend
```

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm start
```

## How to Play

### Quick Match
1. Enter your name
2. Click "Find Match"
3. Wait for an opponent
4. Play!

### Private Game
1. Enter your name
2. Click "Create Private Game"
3. Share the Game ID with your family/friends
4. They enter the Game ID and click "Join"
5. Play!

### Spectator Mode (Streaming)
1. Get a Game ID from someone playing
2. Enter the Game ID
3. Click "Spectate Game"
4. Watch the game live!

## Game Rules

Standard chess rules apply:
- Players alternate turns (White moves first)
- Click a piece to select it, then click the destination square
- Pawns automatically promote to Queen when reaching the end
- The game ends when there's checkmate or a draw

## Project Structure

```
vivido/
├── backend/           # Node.js + Socket.io server
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── GameManager.ts  # Game logic and state
│   │   └── types.ts        # TypeScript types
│   └── package.json
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand store
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
└── package.json       # Root workspace config
```

## Features Explained

### Real-time Synchronization
All game moves are synchronized in real-time using WebSocket connections. When a player makes a move, it's instantly broadcast to:
- The opponent
- All spectators watching the game

### Spectator/Streaming Mode
Games can be watched by unlimited spectators. This is perfect for:
- Family members watching from different rooms
- Streaming games to an audience
- Learning by watching others play

### Mobile Responsive
The UI is fully responsive and works on all devices:
- Desktop computers
- Tablets
- Smartphones

## Future Enhancements

- [ ] Time controls (Blitz, Rapid, Classical)
- [ ] User accounts and authentication
- [ ] ELO rating system
- [ ] Game history and replay
- [ ] Chat during games
- [ ] Tournament mode
- [ ] Puzzle solving mode
- [ ] Analysis board with engine

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

MIT

---

Built with ❤️ for family game nights!
