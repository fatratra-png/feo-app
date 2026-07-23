import { Outlet } from 'react-router-dom';
import { PlayerBar } from '../player/PlayerBar';
import { PlayerPanel } from '../player/PlayerPanel';
import { useKeyboard } from '../../hooks/useKeyboard';
import { usePlayerStore } from '../../stores/playerStore';

export function Layout() {
  useKeyboard();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const panelOpen = !!currentTrack;

  return (
    <div className="min-h-screen bg-background flex">
      <main
        className="flex-1 min-w-0 transition-all duration-500 ease-out"
        style={{ marginRight: panelOpen ? '420px' : '0' }}
      >
        <Outlet />
      </main>
      <PlayerPanel />
      <PlayerBar />
    </div>
  );
}
