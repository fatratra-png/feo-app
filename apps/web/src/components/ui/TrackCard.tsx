import { usePlayerStore } from '../../stores/playerStore';
import { CD } from './CD';
import { formatDuration } from '../../lib/utils';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    duration: number;
    file_url?: string | null;
    artist_name: string;
    album_title: string;
    album_cover_url: string | null;
    source?: 'local' | 'youtube';
    plays_count?: number;
  };
  index?: number;
}

const COLORS = ['#FFD700', '#FF6B9D', '#0057FF', '#00D68F', '#B366FF', '#FF9500', '#FF3B30', '#00C7BE'];

function hashColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { play, currentTrack, isPlaying, pause, resume } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isActive && isPlaying;
  const isYoutube = track.source === 'youtube';
  const accent = hashColor(track.title);
  const rotation = index !== undefined ? (index % 3 === 0 ? -0.5 : index % 3 === 1 ? 0.5 : 0) : 0;

  const handleClick = () => {
    if (isActive) {
      isPlaying ? pause() : resume();
    } else {
      play(track as any);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex flex-col rounded-xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-2 hover:rotate-2 active:translate-y-[3px] active:rotate-0 overflow-hidden brutal-shadow-sm hover:brutal-shadow-ink ${
        isActive ? 'border-saffron bg-saffron/10 brutal-shadow-saffron' : 'border-border bg-card hover:border-foreground/30'
      }`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="h-1.5 w-full flex-shrink-0" style={{ backgroundColor: accent }} />
      <div className="relative aspect-square flex items-center justify-center bg-muted/20" style={{ background: `linear-gradient(135deg, ${accent}15, transparent)` }}>
        <CD title={track.title} artist={track.artist_name} size="md" />
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
          isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <span className="size-14 rounded-full border-2 border-background flex items-center justify-center backdrop-blur-sm brutal-shadow-sm" style={{ backgroundColor: `${accent}99` }}>
            {isCurrentlyPlaying ? (
              <span className="flex gap-0.5">
                <span className="w-0.5 h-5 bg-background rounded-full" />
                <span className="w-0.5 h-5 bg-background rounded-full" />
              </span>
            ) : (
              <span className="text-background text-xl ml-0.5">&#9654;</span>
            )}
          </span>
        </div>
        {isYoutube && (
          <span className="absolute top-2 right-2 chip text-[6px] px-1.5 py-0.5 bg-blush text-white border-white z-10 rotate-6">
            YT
          </span>
        )}
        {index !== undefined && (
          <span className="absolute bottom-2 left-2 font-mono text-[8px] font-bold text-foreground/20 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>
      <div className="px-3 py-3 min-w-0 border-t-2 border-border/50">
        <p className={`font-display font-bold text-xs leading-tight truncate ${isActive ? 'text-foreground' : 'text-foreground/90'}`}>{track.title}</p>
        <p className="text-[9px] font-mono text-foreground/40 mt-1 truncate flex items-center gap-1">
          <span className="size-1 rounded-full inline-block" style={{ backgroundColor: accent }} />
          {track.artist_name}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="chip text-[6px] tabular-nums" style={{ borderColor: `${accent}40`, color: accent }}>{formatDuration(track.duration)}</span>
          {isYoutube && track.plays_count ? (
            <span className="chip text-[6px] border-saffron/30 text-saffron">{(track.plays_count / 1000000).toFixed(1)}M</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
