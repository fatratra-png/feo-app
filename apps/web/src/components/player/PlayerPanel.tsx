import { useState, useRef, useEffect, useCallback } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { NextTrackDisplay } from './NextTrackDisplay';
import { CD } from '../ui/CD';
import { formatDuration } from '../../lib/utils';
import {
  X,
  Shuffle,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
  Volume2,
  VolumeX,
  Music,
  ListMusic,
  Mic2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export function PlayerPanel() {
  const [showQueue, setShowQueue] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentTrack, isPlaying, volume, progress, queue, queueIndex,
    pause, next, previous, isLoadingAudio, repeat, autoPlay, shuffle, isMuted,
    setVolume, setProgress, cycleRepeat, toggleShuffle, toggleMute, toggleAutoPlay,
    removeFromQueue, clearQueue, playNext, isPanelCollapsed, togglePanel, expandPanel,
  } = usePlayerStore();

  const resume = useCallback(() => usePlayerStore.getState().resume(), []);
  const isOpen = !!currentTrack;
  const isExpanded = !isPanelCollapsed;

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack?.file_url) {
      if (audio.src !== currentTrack.file_url) { audio.src = currentTrack.file_url; audio.load(); }
      audio.volume = isMuted ? 0 : volume;
      if (isPlaying) audio.play().catch(() => {});
    }
  }, [currentTrack?.file_url, currentTrack?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.file_url) return;
    if (isPlaying && !isLoadingAudio) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, isLoadingAudio]);

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

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  const progressPct = currentTrack && currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  return (
    <>
      {currentTrack && !isExpanded && (
        <button
          onClick={expandPanel}
          className="fixed bottom-6 right-6 z-[60] size-14 rounded-full border-2 border-saffron bg-card brutal-shadow-saffron flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <CD title={currentTrack.title} artist={currentTrack.artist_name} size="sm" />
        </button>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-background border-l-2 border-border z-50 flex flex-col transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0 ${
          isExpanded ? 'md:translate-x-0' : 'md:translate-x-full'
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-saffron via-blush to-mint flex-shrink-0" />
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              <span className="absolute inset-0 rounded-full bg-saffron animate-ping opacity-40" />
              <span className="relative rounded-full bg-saffron size-2.5" />
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-saffron uppercase font-bold">Now Playing</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQueue(!showQueue)} className={`size-8 flex items-center justify-center rounded-full border-2 transition-all active:translate-y-[1px] ${showQueue ? 'border-saffron bg-saffron/15 text-saffron brutal-shadow-saffron' : 'border-border text-foreground/40 hover:text-foreground hover:bg-muted/30'}`}>
              <ListMusic className="size-3.5" />
            </button>
            <button onClick={togglePanel} className={`size-8 flex items-center justify-center rounded-full border-2 transition-all active:translate-y-[1px] ${!isExpanded ? 'border-mint bg-mint/15 text-mint brutal-shadow-mint' : 'border-border text-foreground/40 hover:text-foreground hover:bg-muted/30'}`}>
              <ChevronDown className={`size-3.5 transition-transform ${!isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className={`flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto transition-all duration-300 ${!isExpanded ? 'hidden' : ''}`}>
          {currentTrack && (
            <>
              <div className="relative mb-8 flex-shrink-0 -rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="brutal-shadow-ink rounded-full">
                  <CD title={currentTrack.title} artist={currentTrack.artist_name} size="lg" />
                </div>
              </div>

              <div className="text-center w-full max-w-sm">
                <p className="font-display text-2xl font-extrabold tracking-[-0.02em] leading-tight truncate">{currentTrack.title}</p>
                <p className="text-sm font-mono text-foreground/50 mt-2 flex items-center justify-center gap-1.5">
                  <Mic2 className="size-3.5" />
                  {currentTrack.artist_name}
                </p>
              </div>

              <div className="w-full max-w-sm mt-8 space-y-2">
                <div className="relative h-1.5 bg-muted rounded-full brutal-shadow-ink">
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-saffron to-blush rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex items-center justify-between relative">
                  <span className="text-[9px] font-mono text-foreground/40 tabular-nums">{formatDuration(progress)}</span>
                  <input
                    type="range"
                    min={0}
                    max={currentTrack.duration || 100}
                    value={progress}
                    onChange={seek}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-foreground/40 tabular-nums">{formatDuration(currentTrack.duration)}</span>
                </div>
              </div>

              <NextTrackDisplay />

              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={toggleShuffle} className={`size-10 flex items-center justify-center rounded-full border-2 transition-all hover:bg-saffron hover:text-black active:translate-y-[2px] brutal-shadow-sm ${shuffle ? 'border-saffron bg-saffron/15 text-saffron' : 'border-border text-foreground/40 hover:border-foreground/50'}`}>
                  <Shuffle className="size-4" />
                </button>
                <button onClick={previous} className="size-12 flex items-center justify-center rounded-full border-2 border-border text-foreground/60 hover:text-blush hover:border-blush hover:bg-blush/10 transition-all active:translate-y-[2px] brutal-shadow-sm">
                  <SkipBack className="size-5" />
                </button>
                <button
                  onClick={() => (isPlaying ? pause() : resume())}
                  className="size-16 flex items-center justify-center rounded-full bg-saffron text-black border-2 border-foreground brutal-shadow-saffron transition-all active:translate-y-[3px] active:shadow-[2px_2px_0_0_#FFD700]"
                  disabled={isLoadingAudio}
                >
                  {isLoadingAudio ? (
                    <span className="size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="size-7 fill-black" />
                  ) : (
                    <Play className="size-7 fill-black ml-1" />
                  )}
                </button>
                <button onClick={next} className="size-12 flex items-center justify-center rounded-full border-2 border-border text-foreground/60 hover:text-mint hover:border-mint hover:bg-mint/10 transition-all active:translate-y-[2px] brutal-shadow-sm">
                  <SkipForward className="size-5" />
                </button>
                <button onClick={cycleRepeat} className={`size-10 flex items-center justify-center rounded-full border-2 transition-all hover:bg-saffron hover:text-black active:translate-y-[2px] brutal-shadow-sm ${repeat !== 'off' ? 'border-saffron bg-saffron/15 text-saffron' : 'border-border text-foreground/40 hover:border-foreground/50'}`}>
                  <Repeat className="size-4" />
                  {repeat === 'one' && <span className="absolute text-[7px] font-mono font-bold mt-3">1</span>}
                </button>
              </div>

              <div className="flex items-center gap-4 mt-8 px-4 py-3 rounded-full border-2 border-border bg-gradient-to-r from-saffron/5 via-blush/5 to-mint/5">
                <button onClick={toggleMute} className={`size-8 flex items-center justify-center rounded-full border-2 transition-all active:translate-y-[1px] ${isMuted ? 'border-blush bg-blush/15 text-blush brutal-shadow-blush' : 'border-border text-foreground/40 hover:text-blush hover:border-blush hover:bg-blush/10'}`}>
                  {isMuted || volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="brutal-slider w-24"
                />
                <button onClick={toggleAutoPlay} className={`size-8 flex items-center justify-center rounded-full border-2 transition-all active:translate-y-[1px] ${autoPlay ? 'border-mint bg-mint/15 text-mint brutal-shadow-mint' : 'border-border text-foreground/40 hover:text-mint hover:border-mint hover:bg-mint/10'}`}>
                  <Music className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {showQueue && isExpanded && currentTrack && (
          <div className="border-t-2 border-border px-5 py-4 max-h-56 overflow-y-auto transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <span className="eyebrow">Up Next</span>
                <span className="chip text-[7px]">{queue.length}</span>
              </span>
              <div className="flex gap-2">
                {queue.length > 0 && (
                  <button onClick={clearQueue} className="chip text-[7px] cursor-pointer hover:bg-blush hover:text-white transition-colors">Clear</button>
                )}
                <button onClick={() => setShowQueue(false)} className="chip text-[7px] cursor-pointer">Close</button>
              </div>
            </div>
            <div className="space-y-1">
              {queue.map((track, i) => {
                const isCurrent = i === queueIndex;
                const colors = ['border-saffron/30', 'border-blush/30', 'border-mint/30'];
                const borderColor = colors[i % colors.length];
                return (
                  <div key={`${track.id}-${i}`} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm transition-all hover:-translate-x-0.5 ${isCurrent ? 'border-saffron bg-saffron/10 brutal-shadow-sm' : `${borderColor} bg-card hover:border-foreground/30`}`}>
                    <span className={`font-mono text-[9px] tabular-nums w-4 flex-shrink-0 ${isCurrent ? 'text-saffron' : 'text-foreground/30'}`}>{i + 1}</span>
                    <CD title={track.title} artist={track.artist_name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs truncate ${isCurrent ? 'font-semibold' : 'text-foreground/90'}`}>{track.title}</p>
                      <p className="text-[9px] font-mono text-foreground/40 mt-0.5 truncate">{track.artist_name}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {!isCurrent && (
                        <button onClick={() => playNext(track)} className="size-6 flex items-center justify-center rounded-full border-2 border-border text-foreground/30 hover:text-mint hover:border-mint transition-all active:translate-y-[1px]">
                          <ChevronRight className="size-3" />
                        </button>
                      )}
                      <button onClick={() => removeFromQueue(track.id)} className="size-6 flex items-center justify-center rounded-full border-2 border-border text-foreground/30 hover:text-blush hover:border-blush transition-all active:translate-y-[1px]">
                        <X className="size-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {queue.length === 0 && (
                <p className="text-xs font-mono text-foreground/30 py-6 text-center">
                  {autoPlay ? 'Auto-play is on — similar tracks will play next' : 'Queue is empty'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
