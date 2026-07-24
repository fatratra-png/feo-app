import { usePlayerStore } from '../../stores/playerStore';
import { CD } from '../ui/CD';
import { Play, Pause } from 'lucide-react';

export function PlayerBar() {
  const { currentTrack, progress, isPanelCollapsed, expandPanel, isPlaying, pause, resume } = usePlayerStore();

  if (!currentTrack) return null;

  const progressPct = currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  if (!isPanelCollapsed) return null;

  return (
    <div
      onClick={expandPanel}
      className="fixed bottom-0 left-0 right-0 z-40 cursor-pointer group"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 bg-card/95 backdrop-blur-md border-t-2 border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CD title={currentTrack.title} artist={currentTrack.artist_name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate text-foreground">{currentTrack.title}</p>
            <p className="text-[9px] font-mono text-foreground/50 truncate">{currentTrack.artist_name}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            isPlaying ? pause() : resume();
          }}
          className="size-8 flex items-center justify-center rounded-full border-2 border-saffron text-saffron hover:bg-saffron hover:text-black transition-all active:translate-y-[1px]"
        >
          {isPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current ml-0.5" />}
        </button>
      </div>
      <div className="relative h-1 bg-muted">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-saffron to-blush transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
