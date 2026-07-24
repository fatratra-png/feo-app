import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore';
import { recommendationsApi } from '../../lib/api';
import { CD } from '../ui/CD';

export function NextTrackDisplay() {
  const { currentTrack, queue, queueIndex, autoPlay } = usePlayerStore();
  const [nextTrack, setNextTrack] = useState<any>(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNextTrack = async () => {
      if (!currentTrack) {
        setNextTrack(null);
        return;
      }

      const upcomingIndex = queueIndex + 1;
      
      // If there's a next track in the manual queue, show it
      if (upcomingIndex < queue.length) {
        setNextTrack(queue[upcomingIndex]);
        setIsAIGenerated(false);
        return;
      }

      // If auto-play is enabled, fetch AI-generated next track
      if (autoPlay) {
        setLoading(true);
        try {
          const result = await recommendationsApi.getUpNext(currentTrack.id, 1);
          if (result.tracks && result.tracks.length > 0) {
            setNextTrack(result.tracks[0]);
            setIsAIGenerated(result.source === 'llm');
          }
        } catch (err) {
          console.error('Failed to fetch next track:', err);
          setNextTrack(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNextTrack();
  }, [currentTrack, queue, queueIndex, autoPlay]);

  if (!currentTrack || !nextTrack) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-mint/30 bg-mint/5 hover:border-mint/50 transition-all">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ChevronRight className="w-4 h-4 text-mint/60 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-mono text-mint/60 tracking-wider uppercase">
            {isAIGenerated ? 'AI Suggested Next' : 'Up Next'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {isAIGenerated && <Sparkles className="w-3 h-3 text-saffron flex-shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-foreground">{nextTrack.title}</p>
              <p className="text-xs font-mono text-foreground/50 truncate">{nextTrack.artist_name}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        {loading ? (
          <span className="size-8 border-2 border-mint/30 border-t-mint rounded-full animate-spin flex items-center justify-center" />
        ) : (
          <CD title={nextTrack.title} artist={nextTrack.artist_name} size="sm" />
        )}
      </div>
    </div>
  );
}
