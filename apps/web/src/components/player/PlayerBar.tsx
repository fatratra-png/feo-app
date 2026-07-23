import { usePlayerStore } from '../../stores/playerStore';

export function PlayerBar() {
  const { currentTrack, progress } = usePlayerStore();

  if (!currentTrack) return null;

  const progressPct = currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-80 right-0 z-50">
      <div className="relative h-1 bg-muted">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-saffron to-blush transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
