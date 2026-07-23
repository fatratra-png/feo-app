import { formatDuration } from '../../lib/utils';
import { usePlayerStore } from '../../stores/playerStore';
import { CD } from './CD';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    duration: number;
    artist_name: string;
    album_title: string;
    album_cover_url: string | null;
    source?: 'local' | 'youtube';
    plays_count?: number;
  };
  index?: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { play, currentTrack } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;
  const isYoutube = track.source === 'youtube';

  return (
    <div
      onClick={() => play(track)}
        className={`brutal-card flex items-center gap-5 px-5 py-4 cursor-pointer ${
        isActive ? 'bg-brutal-yellow text-black' : 'bg-[#1e1e1e]'
      }`}
    >
      {index !== undefined && (
        <span className="section-index w-8 text-center text-sm font-mono">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      <div className="relative flex-shrink-0">
        <CD title={track.title} artist={track.artist_name} size="sm" />
        {isYoutube && (
          <span className="absolute -top-2 -right-2 metadata-tag text-[7px] px-1.5 py-0.5 bg-brutal-red text-white border-white leading-none">
            YT
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-base uppercase tracking-tight truncate leading-tight">{track.title}</p>
        <p className="text-xs font-mono opacity-50 mt-1 truncate">{track.artist_name}</p>
      </div>
      {isYoutube && track.plays_count ? (
        <span className="metadata-tag text-[9px] flex-shrink-0">{(track.plays_count / 1000000).toFixed(1)}M</span>
      ) : null}
      <span className="metadata-tag flex-shrink-0">{formatDuration(track.duration)}</span>
    </div>
  );
}