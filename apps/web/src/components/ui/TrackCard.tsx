import { formatDuration } from '../../lib/utils';
import { usePlayerStore } from '../../stores/playerStore';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    duration: number;
    artist_name: string;
    album_title: string;
    album_cover_url: string | null;
  };
  index?: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const { play, currentTrack, queue } = usePlayerStore();

  const isActive = currentTrack?.id === track.id;

  return (
    <div
      onClick={() => play(track)}
      className={`brutal-card flex items-center gap-4 p-3 cursor-pointer ${
        isActive ? 'bg-brutal-yellow' : 'bg-white dark:bg-[#1a1a1a]'
      }`}
    >
      {index !== undefined && (
        <span className="section-index w-6 text-center">{String(index + 1).padStart(2, '0')}</span>
      )}
      {track.album_cover_url && (
        <img src={track.album_cover_url} alt="" className="w-10 h-10 brutal-border-thin object-cover" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{track.title}</p>
        <p className="text-xs font-mono opacity-60 truncate">{track.artist_name}</p>
      </div>
      <span className="metadata-tag">{formatDuration(track.duration)}</span>
    </div>
  );
}