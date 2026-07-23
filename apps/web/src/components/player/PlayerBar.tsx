import { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';

export function PlayerBar() {
  const {
    currentTrack, isPlaying, volume, progress, queue, queueIndex,
    pause, next, previous, isLoadingAudio,
    setVolume, setProgress, addToQueue, removeFromQueue, clearQueue,
  } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack?.file_url) {
      if (audio.src !== currentTrack.file_url) { audio.src = currentTrack.file_url; audio.load(); }
      audio.volume = volume;
      if (isPlaying) audio.play().catch(() => {});
    }
  }, [currentTrack?.file_url, currentTrack?.id]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

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
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('ended', onEnded); };
  }, [next, setProgress]);

  const resume = () => usePlayerStore.getState().resume();

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const handleToggleExpand = () => setExpanded(!expanded);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 brutal-border bg-white dark:bg-[#1a1a1a] z-50 px-6 py-4">
        <div className="flex items-center justify-center max-w-6xl mx-auto">
          <p className="font-mono text-xs opacity-30 uppercase tracking-widest">Select a track to start listening</p>
        </div>
      </div>
    );
  }

  const progressPct = currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  return (
    <>
      {/* Mini player bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 brutal-border bg-white dark:bg-[#1a1a1a] z-50 transition-all ${
          expanded ? 'pb-4' : ''
        }`}
      >
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-1 bg-brutal-yellow transition-all cursor-pointer"
          style={{ width: `${progressPct}%` }}
          onClick={() => setExpanded(true)}
        />

        <div className="px-4 py-2 flex items-center gap-3 max-w-6xl mx-auto relative">
          {/* Track info */}
          <div className="flex items-center gap-3 w-72 min-w-0 cursor-pointer" onClick={handleToggleExpand}>
            {currentTrack.album_cover_url && (
              <div className="relative flex-shrink-0">
                <img src={currentTrack.album_cover_url} alt="" className="w-11 h-11 brutal-border-thin object-cover" />
                {currentTrack.source === 'youtube' && (
                  <span className="absolute -top-1.5 -right-1.5 metadata-tag text-[7px] px-1 py-0.5 bg-brutal-red text-white border-white leading-none">YT</span>
                )}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate uppercase">{currentTrack.title}</p>
              <p className="text-[10px] font-mono opacity-60 truncate">{currentTrack.artist_name}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-3">
              <button onClick={previous} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                &#9646;&#9644;
              </button>
              <button
                onClick={() => (isPlaying ? pause() : resume())}
                className="brutal-btn w-10 h-10 flex items-center justify-center text-sm font-bold bg-brutal-yellow disabled:opacity-50 play-btn"
                disabled={isLoadingAudio}
              >
                {isLoadingAudio ? (
                  <span className="animate-pulse">&#8942;</span>
                ) : isPlaying ? (
                  <span className="text-lg">&#9646;&#9646;</span>
                ) : (
                  <span className="text-lg ml-0.5">&#9654;</span>
                )}
              </button>
              <button onClick={next} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                &#9644;&#9646;
              </button>
            </div>
            <div className="flex items-center gap-2 w-full max-w-md">
              <span className="text-[10px] font-mono w-8 text-right opacity-50">{formatDuration(progress)}</span>
              <input
                type="range"
                min={0}
                max={currentTrack.duration || 100}
                value={progress}
                onChange={seek}
                className="brutal-slider flex-1 h-1.5"
              />
              <span className="text-[10px] font-mono w-8 opacity-50">{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 w-32 justify-end">
            <button
              onClick={handleToggleExpand}
              className={`text-xs opacity-60 hover:opacity-100 transition-all ${expanded ? 'rotate-180' : ''}`}
            >
              &#9650;
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono opacity-50">VOL</span>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="brutal-slider w-16 h-1.5"
              />
            </div>
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="border-t-3 border-black dark:border-[#444] px-4 py-4 max-w-6xl mx-auto">
            <div className="flex gap-8">
              {/* Current track detail */}
              <div className="flex-shrink-0 w-64">
                {currentTrack.album_cover_url && (
                  <img
                    src={currentTrack.album_cover_url}
                    alt=""
                    className="w-full aspect-square brutal-border object-cover mb-3"
                  />
                )}
                <p className="font-black uppercase text-lg leading-tight">{currentTrack.title}</p>
                <p className="text-sm font-mono opacity-60 mt-1">{currentTrack.artist_name}</p>
                {currentTrack.source === 'youtube' && (
                  <span className="mt-2 metadata-tag text-[9px] bg-brutal-red text-white border-white inline-block">YouTube</span>
                )}
              </div>

              {/* Queue */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black uppercase text-sm">
                    Queue
                    <span className="ml-2 metadata-tag text-[9px]">{queue.length} tracks</span>
                  </h3>
                  {queue.length > 0 && (
                    <button
                      onClick={clearQueue}
                      className="metadata-tag text-[9px] cursor-pointer hover:bg-brutal-red hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {queue.map((track, i) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-2 p-2 brutal-border-thin text-xs queue-enter ${
                        i === queueIndex ? 'bg-brutal-yellow' : 'bg-transparent'
                      }`}
                    >
                      <span className="font-mono opacity-50 w-4 flex-shrink-0">{i + 1}</span>
                      {track.album_cover_url && (
                        <img src={track.album_cover_url} alt="" className="w-7 h-7 brutal-border-thin object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold uppercase truncate">{track.title}</p>
                        <p className="opacity-50 truncate">{track.artist_name}</p>
                      </div>
                      <button
                        onClick={() => removeFromQueue(track.id)}
                        className="opacity-30 hover:opacity-100 transition-opacity ml-1 flex-shrink-0"
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                  {queue.length === 0 && (
                    <p className="text-xs font-mono opacity-30">queue is empty</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}