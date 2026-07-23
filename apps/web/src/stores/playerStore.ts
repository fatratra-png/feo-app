import { create } from 'zustand';

interface Track {
  id: string;
  title: string;
  duration: number;
  file_url: string | null;
  artist_name: string;
  album_title: string;
  album_cover_url: string | null;
  source?: 'local' | 'youtube';
  youtube_id?: string;
}

type RepeatMode = 'off' | 'one' | 'all';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  queueIndex: number;
  isLoadingAudio: boolean;
  repeat: RepeatMode;
  autoPlay: boolean;
  play: (track: Track, queue?: Track[]) => void;
  setTrackAudioUrl: (trackId: string, url: string) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  replay: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setRepeat: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
  toggleAutoPlay: () => void;
}

function fetchAudio(track: Track): Promise<string | null> {
  if (track.source !== 'youtube' || !track.youtube_id) return Promise.resolve(null);
  return fetch(`/api/youtube/play/${track.youtube_id}`)
    .then((r) => r.json())
    .then((data) => data.audioUrl || null)
    .catch(() => null);
}

function needsAudioFetch(track: Track): boolean {
  return track.source === 'youtube' && !track.file_url;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: parseFloat(localStorage.getItem('feo_volume') || '0.7'),
  progress: 0,
  queueIndex: -1,
  isLoadingAudio: false,
  repeat: (localStorage.getItem('feo_repeat') as RepeatMode) || 'off',
  autoPlay: localStorage.getItem('feo_autoplay') === 'true',

  play: (track, queue) => {
    const currentQueue = queue || get().queue;
    const index = currentQueue.findIndex((t) => t.id === track.id);
    const needsFetch = needsAudioFetch(track);

    set({
      currentTrack: track,
      queue: currentQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: !needsFetch,
      progress: 0,
      isLoadingAudio: needsFetch,
    });

    if (needsFetch && track.youtube_id) {
      fetch(`/api/youtube/play/${track.youtube_id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.audioUrl) {
            get().setTrackAudioUrl(track.id, data.audioUrl);
            set({ isPlaying: true, isLoadingAudio: false });
          }
        })
        .catch(() => set({ isLoadingAudio: false }));
    }
  },

  setTrackAudioUrl: (trackId, url) => {
    const { currentTrack, queue } = get();
    if (currentTrack?.id === trackId) {
      set({ currentTrack: { ...currentTrack, file_url: url } });
    }
    set({ queue: queue.map((t) => (t.id === trackId ? { ...t, file_url: url } : t)) });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  replay: () => {
    const { currentTrack } = get();
    if (!currentTrack) return;
    set({ progress: 0, isPlaying: true });
    const audio = document.querySelector('audio');
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
  },

  next: () => {
    const { queue, queueIndex, repeat, autoPlay, currentTrack } = get();
    let nextIndex = queueIndex + 1;

    if (repeat === 'one' && currentTrack) {
      get().replay();
      return;
    }

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else if (autoPlay && currentTrack) {
        const query = `${currentTrack.title} ${currentTrack.artist_name}`;
        set({ isLoadingAudio: true });
        fetch(`/api/youtube/related?q=${encodeURIComponent(query)}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist_name)}`)
          .then((r) => r.json())
          .then((data) => {
            const tracks = data.tracks || [];
            const filtered = tracks.filter((t: any) => t.id !== currentTrack.id);
            if (filtered.length > 0) {
              const nextTrack = filtered[0];
              const newQueue = [nextTrack];
              get().play(nextTrack, newQueue);
            } else {
              set({ isPlaying: false, isLoadingAudio: false });
            }
          })
          .catch(() => set({ isLoadingAudio: false }));
        return;
      } else {
        set({ isPlaying: false, currentTrack: null, queueIndex: -1 });
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    const needsFetch = needsAudioFetch(nextTrack);
    set({
      currentTrack: nextTrack,
      queueIndex: nextIndex,
      isPlaying: !needsFetch,
      progress: 0,
      isLoadingAudio: needsFetch,
    });

    if (needsFetch && nextTrack.youtube_id) {
      fetch(`/api/youtube/play/${nextTrack.youtube_id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.audioUrl) {
            get().setTrackAudioUrl(nextTrack.id, data.audioUrl);
            set({ isPlaying: true, isLoadingAudio: false });
          }
        })
        .catch(() => set({ isLoadingAudio: false }));
    }
  },

  previous: () => {
    const { queue, queueIndex } = get();
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = queue[prevIndex];
      const needsFetch = needsAudioFetch(prevTrack);
      set({
        currentTrack: prevTrack,
        queueIndex: prevIndex,
        isPlaying: !needsFetch,
        progress: 0,
        isLoadingAudio: needsFetch,
      });
      if (needsFetch && prevTrack.youtube_id) {
        fetch(`/api/youtube/play/${prevTrack.youtube_id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.audioUrl) {
              get().setTrackAudioUrl(prevTrack.id, data.audioUrl);
              set({ isPlaying: true, isLoadingAudio: false });
            }
          })
          .catch(() => set({ isLoadingAudio: false }));
      }
    }
  },

  setVolume: (volume) => {
    localStorage.setItem('feo_volume', String(volume));
    set({ volume });
  },

  setProgress: (progress) => set({ progress }),
  setQueue: (queue) => set({ queue }),

  addToQueue: (track) => {
    const { queue } = get();
    if (!queue.find((t) => t.id === track.id)) {
      set({ queue: [...queue, track] });
    }
  },

  removeFromQueue: (trackId) => {
    const { queue, queueIndex, currentTrack } = get();
    const newQueue = queue.filter((t) => t.id !== trackId);
    const removedIndex = queue.findIndex((t) => t.id === trackId);
    let newIndex = queueIndex;
    if (removedIndex >= 0 && removedIndex < queueIndex) newIndex--;
    if (currentTrack?.id === trackId) {
      set({ queue: newQueue, currentTrack: newQueue[newIndex] || null, queueIndex: Math.min(newIndex, newQueue.length - 1), isPlaying: !!newQueue[newIndex] });
    } else {
      set({ queue: newQueue, queueIndex: newIndex });
    }
  },

  clearQueue: () => set({ queue: [], queueIndex: -1, currentTrack: null, isPlaying: false }),

  setRepeat: (mode) => {
    localStorage.setItem('feo_repeat', mode);
    set({ repeat: mode });
  },

  cycleRepeat: () => {
    const { repeat } = get();
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const idx = modes.indexOf(repeat);
    const next = modes[(idx + 1) % modes.length];
    localStorage.setItem('feo_repeat', next);
    set({ repeat: next });
  },

  toggleAutoPlay: () => {
    const { autoPlay } = get();
    localStorage.setItem('feo_autoplay', String(!autoPlay));
    set({ autoPlay: !autoPlay });
  },
}));