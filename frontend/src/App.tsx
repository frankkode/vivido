import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import { Menu } from './components/Menu';
import { Matchmaking } from './components/Matchmaking';
import { ChessGame } from './components/ChessGame';

function App() {
  const socket = useSocket();
  const { mode } = useGameStore();

  return (
    <div className="App">
      {mode === 'menu' && <Menu socket={socket} />}
      {mode === 'matchmaking' && <Matchmaking socket={socket} />}
      {mode === 'playing' && <ChessGame socket={socket} />}
      {mode === 'spectating' && <ChessGame socket={socket} isSpectator={true} />}
    </div>
  );
}

export default App;
