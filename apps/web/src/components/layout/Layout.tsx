import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from '../player/PlayerBar';

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-72 flex-1 pb-28">
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}