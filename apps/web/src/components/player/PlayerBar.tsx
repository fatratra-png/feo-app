import { useRef, useEffect } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    pause,
    next,
    previous,
    isLoadingAudio,
    setVolume,
    setProgress,
  } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack?.file_url) {
      if (audio.src !== currentTrack.file_url) {
        audio.src = currentTrack.file_url;
        audio.load();
      }
      audio.volume = volume;
      if (isPlaying) audio.play().catch(() => {});
    }
  }, [currentTrack?.file_url, currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.file_url) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onEnded = () => next();
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [next, setProgress]);

  const resume = () => usePlayerStore.getState().resume();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 brutal-border bg-white dark:bg-[#1a1a1a] z-50 px-6 py-3">
      <div className="flex items-center gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 w-72">
          {currentTrack.album_cover_url && (
            <div className="relative">
              <img
                src={currentTrack.album_cover_url}
                alt=""
                className="w-12 h-12 brutal-border-thin object-cover"
              />
              {currentTrack.source === 'youtube' && (
                <span className="absolute -top-1.5 -right-1.5 metadata-tag text-[8px] px-1 py-0.5 bg-brutal-red text-white border-white">
                  YT
                </span>
              )}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{currentTrack.title}</p>
            <p className="text-xs font-mono opacity-60 truncate">{currentTrack.artist_name}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button onClick={previous} className="brutal-btn px-3 py-1 text-sm bg-white dark:bg-[#333]">
              ⏮
            </button>
            <button
              onClick={() => (isPlaying ? pause() : resume())}
              className="brutal-btn px-4 py-1 text-sm font-bold bg-brutal-yellow min-w-[44px] text-center"
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? '⋯' : isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={next} className="brutal-btn px-3 py-1 text-sm bg-white dark:bg-[#333]">
              ⏭
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-lg">
            <span className="text-xs font-mono w-10 text-right">
              {formatDuration(progress)}
            </span>
            <input
              type="range"
              min={0}
              max={currentTrack.duration || 100}
              value={progress}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setProgress(val);
                if (audioRef.current) audioRef.current.currentTime = val;
              }}
              className="brutal-slider flex-1"
            />
            <span className="text-xs font-mono w-10">
              {formatDuration(currentTrack.duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-32">
          <span className="text-xs font-mono">VOL</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="brutal-slider flex-1"
          />
        </div>
      </div>
    </div>
  );
}