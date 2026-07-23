import { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { formatDuration } from '../../lib/utils';

export function PlayerBar() {
  const {
    currentTrack, isPlaying, volume, progress, queue, queueIndex,
    pause, next, previous, replay, isLoadingAudio, repeat, autoPlay,
    setVolume, setProgress, removeFromQueue, clearQueue,
    cycleRepeat, toggleAutoPlay,
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

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 brutal-border bg-[#1e1e1e] z-50 px-8 py-5">
        <div className="flex items-center justify-center max-w-6xl mx-auto">
          <p className="font-mono text-xs opacity-30 uppercase tracking-widest">Select a track to start listening</p>
        </div>
      </div>
    );
  }

  const progressPct = currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  const repeatIcon = repeat === 'one' ? '1' : repeat === 'all' ? '\u21BB' : '\u21BB';
  const repeatTitle = repeat === 'off' ? 'Repeat off' : repeat === 'one' ? 'Repeat one' : 'Repeat all';

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 brutal-border bg-[#1e1e1e] z-50 transition-all ${expanded ? 'pb-6' : ''}`}>
        <div className="relative h-2 bg-[#333] cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="absolute top-0 left-0 h-full bg-brutal-yellow transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="px-6 py-3 flex items-center gap-6 max-w-6xl mx-auto relative">
          <div className="flex items-center gap-4 w-80 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            {currentTrack.album_cover_url ? (
              <div className="relative flex-shrink-0">
                <img src={currentTrack.album_cover_url} alt="" className="w-14 h-14 brutal-border-thin object-cover" />
                {currentTrack.source === 'youtube' && (
                  <span className="absolute -top-2 -right-2 metadata-tag text-[7px] px-1.5 py-0.5 bg-brutal-red text-white border-white leading-none">YT</span>
                )}
              </div>
            ) : (
              <div className="w-14 h-14 brutal-border-thin bg-brutal-yellow flex items-center justify-center text-xl font-black flex-shrink-0">&#9834;</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-black text-base uppercase truncate leading-tight">{currentTrack.title}</p>
              <p className="text-xs font-mono opacity-40 mt-1 truncate">{currentTrack.artist_name}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <button
                onClick={cycleRepeat}
                className={`w-7 h-7 flex items-center justify-center text-xs font-mono brutal-border-thin transition-all hover:bg-brutal-yellow hover:text-black ${repeat !== 'off' ? 'bg-brutal-yellow/20 text-brutal-yellow' : 'opacity-50'}`}
                title={repeatTitle}
              >
                {repeat === 'one' ? '1' : '\u21BB'}
              </button>
              <button onClick={previous} className="w-8 h-8 flex items-center justify-center brutal-border-thin text-sm opacity-60 hover:opacity-100 hover:bg-brutal-yellow hover:text-black transition-all">
                &#9646;&#9644;
              </button>
              <button onClick={replay} className="w-7 h-7 flex items-center justify-center text-xs brutal-border-thin opacity-40 hover:opacity-100 hover:bg-brutal-yellow hover:text-black transition-all" title="Replay">
                &#8634;
              </button>
              <button
                onClick={() => (isPlaying ? pause() : resume())}
                className="brutal-btn w-12 h-12 flex items-center justify-center text-lg font-bold bg-brutal-yellow text-black disabled:opacity-50 play-btn"
                disabled={isLoadingAudio}
              >
                {isLoadingAudio ? (
                  <span className="animate-pulse">&#8942;</span>
                ) : isPlaying ? (
                  <span>&#9646;&#9646;</span>
                ) : (
                  <span className="ml-1">&#9654;</span>
                )}
              </button>
              <button onClick={next} className="w-8 h-8 flex items-center justify-center brutal-border-thin text-sm opacity-60 hover:opacity-100 hover:bg-brutal-yellow hover:text-black transition-all">
                &#9644;&#9646;
              </button>
              <button
                onClick={toggleAutoPlay}
                className={`w-7 h-7 flex items-center justify-center text-xs font-mono brutal-border-thin transition-all hover:bg-brutal-yellow hover:text-black ${autoPlay ? 'bg-brutal-green/20 text-brutal-green' : 'opacity-50'}`}
                title={autoPlay ? 'Auto-play on' : 'Auto-play off'}
              >
                &#9835;
              </button>
            </div>
            <div className="flex items-center gap-3 w-full max-w-lg">
              <span className="text-xs font-mono w-10 text-right opacity-40">{formatDuration(progress)}</span>
              <input type="range" min={0} max={currentTrack.duration || 100} value={progress} onChange={seek} className="brutal-slider flex-1" />
              <span className="text-xs font-mono w-10 opacity-40">{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-40 justify-end">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-8 h-8 flex items-center justify-center brutal-border-thin text-xs transition-all hover:bg-brutal-yellow hover:text-black ${expanded ? 'rotate-180' : ''}`}
            >
              &#9650;
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono opacity-40">VOL</span>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="brutal-slider w-20 h-2" />
            </div>
          </div>
        </div>

        {expanded && (
          <div className="border-t-3 border-[#333] px-6 pt-6 pb-2 max-w-6xl mx-auto">
            <div className="flex gap-10">
              <div className="flex-shrink-0 w-56">
                {currentTrack.album_cover_url ? (
                  <img src={currentTrack.album_cover_url} alt="" className="w-full aspect-square brutal-border object-cover mb-4" />
                ) : (
                  <div className="w-full aspect-square brutal-border bg-brutal-yellow flex items-center justify-center text-5xl font-black mb-4">&#9834;</div>
                )}
                <p className="font-black uppercase text-xl leading-tight">{currentTrack.title}</p>
                <p className="text-sm font-mono opacity-50 mt-1">{currentTrack.artist_name}</p>
                <div className="flex gap-2 mt-4">
                  {currentTrack.source === 'youtube' && (
                    <span className="metadata-tag text-[9px] bg-brutal-red text-white border-white">YouTube</span>
                  )}
                  {autoPlay && <span className="metadata-tag text-[9px] bg-brutal-green text-black border-black">Auto</span>}
                  {repeat !== 'off' && <span className="metadata-tag text-[9px] bg-brutal-yellow text-black border-black">{repeat === 'one' ? 'Repeat 1' : 'Repeat All'}</span>}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black uppercase text-sm tracking-wide">
                    Queue
                    <span className="ml-3 metadata-tag text-[9px]">{queue.length} tracks</span>
                  </h3>
                  {queue.length > 0 && (
                    <button onClick={clearQueue} className="metadata-tag text-[9px] cursor-pointer hover:bg-brutal-red hover:text-white transition-colors">Clear all</button>
                  )}
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                  {queue.map((track, i) => (
                    <div key={track.id} className={`flex items-center gap-3 p-3 brutal-border-thin text-sm queue-enter ${i === queueIndex ? 'bg-brutal-yellow text-black' : 'bg-[#2a2a2a]'}`}>
                      <span className="font-mono opacity-30 w-5 flex-shrink-0 text-xs">{i + 1}</span>
                      {track.album_cover_url ? (
                        <img src={track.album_cover_url} alt="" className="w-10 h-10 brutal-border-thin object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 brutal-border-thin bg-brutal-yellow flex items-center justify-center text-sm font-black flex-shrink-0">&#9834;</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold uppercase text-xs truncate">{track.title}</p>
                        <p className="text-[10px] font-mono opacity-50 mt-0.5 truncate">{track.artist_name}</p>
                      </div>
                      <button onClick={() => removeFromQueue(track.id)} className="w-6 h-6 flex items-center justify-center text-xs brutal-border-thin opacity-30 hover:opacity-100 hover:bg-brutal-red hover:text-white transition-all flex-shrink-0">&#10005;</button>
                    </div>
                  ))}
                  {queue.length === 0 && (
                    <p className="text-sm font-mono opacity-30 py-8 text-center">
                      {autoPlay ? 'Auto-play is on \u2014 similar tracks will play next' : 'Queue is empty'}
                    </p>
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