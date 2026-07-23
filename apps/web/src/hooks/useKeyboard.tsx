import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../stores/playerStore';

interface Shortcut {
  keys: string[];
  action: string;
  desc: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: [' ', 'k'], action: 'togglePlay', desc: 'Play / Pause' },
  { keys: ['\u2192'], action: 'next', desc: 'Next track' },
  { keys: ['\u2190'], action: 'prev', desc: 'Previous track' },
  { keys: ['\u2191'], action: 'volumeUp', desc: 'Volume up' },
  { keys: ['\u2193'], action: 'volumeDown', desc: 'Volume down' },
  { keys: ['m'], action: 'mute', desc: 'Toggle mute' },
  { keys: ['s'], action: 'shuffle', desc: 'Toggle shuffle' },
  { keys: ['r'], action: 'repeat', desc: 'Cycle repeat mode' },
  { keys: ['/'], action: 'search', desc: 'Focus search' },
  { keys: ['Esc'], action: 'clear', desc: 'Clear / close' },
];

export function useKeyboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') (target as HTMLInputElement).blur();
        return;
      }

      const state = usePlayerStore.getState();
      const key = e.key;
      const meta = e.metaKey || e.ctrlKey;

      if (key === ' ' || (meta && key === 'k')) {
        e.preventDefault();
        state.currentTrack
          ? (state.isPlaying ? state.pause() : state.resume())
          : null;
      } else if (meta && key === 'ArrowRight') {
        e.preventDefault();
        state.next();
      } else if (meta && key === 'ArrowLeft') {
        e.preventDefault();
        state.previous();
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        if (!meta) state.setVolume(Math.min(1, state.volume + 0.1));
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (!meta) state.setVolume(Math.max(0, state.volume - 0.1));
      } else if (key === 'm') {
        state.toggleMute();
      } else if (key === 's') {
        state.toggleShuffle();
      } else if (key === 'r') {
        state.cycleRepeat();
      } else if (meta && key === '/') {
        e.preventDefault();
        navigate('/search');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);
}

function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-xs text-foreground/60">{shortcut.desc}</span>
      <kbd className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-foreground/70">
        {shortcut.keys.map((k, i) => (
          <span key={i}>
            {k === ' ' ? 'Space' : k}
            {i < shortcut.keys.length - 1 && <span className="mx-0.5 opacity-40">/</span>}
          </span>
        ))}
      </kbd>
    </div>
  );
}

export function ShortcutsHelp() {
  return (
    <div className="space-y-1.5">
      {SHORTCUTS.map((s) => (
        <ShortcutRow key={s.action} shortcut={s} />
      ))}
    </div>
  );
}
