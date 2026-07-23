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
  isMuted: boolean;
  queueIndex: number;
  isLoadingAudio: boolean;
  repeat: RepeatMode;
  autoPlay: boolean;
  shuffle: boolean;

  play: (track: Track, queue?: Track[]) => void;
  setTrackAudioUrl: (trackId: string, url: string) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  replay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setRepeat: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
  toggleAutoPlay: () => void;
  toggleShuffle: () => void;
  getUpNext: () => Track[];
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  isMuted: false,
  queueIndex: -1,
  isLoadingAudio: false,
  repeat: 'off',
  autoPlay: false,
  shuffle: false,

  play: (track, queue) => {
    const currentQueue = queue || get().queue;
    const index = currentQueue.findIndex((t) => t.id === track.id);
    set({
      currentTrack: track,
      queue: currentQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
      isLoadingAudio: false,
    });
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
    set({ isPlaying: true });
  },

  next: () => {
    const { queue, queueIndex, repeat, autoPlay, currentTrack, shuffle } = get();

    if (repeat === 'one' && currentTrack) {
      get().replay();
      return;
    }

    let nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
        set({ currentTrack: queue[nextIndex], queueIndex: nextIndex, isPlaying: true });
        return;
      } else if (autoPlay && currentTrack) {
        set({ isPlaying: false, isLoadingAudio: true });
        const query = `${currentTrack.title} ${currentTrack.artist_name}`;
        fetch(`/api/youtube/related?q=${encodeURIComponent(query)}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist_name)}`)
          .then((r) => r.json())
          .then((data) => {
            const tracks = data.tracks || [];
            const filtered = tracks.filter((t: any) => t.id !== currentTrack.id);
            if (filtered.length > 0) {
              const nextTrack = filtered[0];
              const newQueue = [...get().queue.filter(t => t.id !== nextTrack.id), nextTrack];
              set({ currentTrack: nextTrack, queue: newQueue, queueIndex: newQueue.length - 1, isPlaying: true, isLoadingAudio: false });
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

    set({
      currentTrack: queue[nextIndex],
      queueIndex: nextIndex,
      isPlaying: true,
    });
  },

  previous: () => {
    const { queue, queueIndex } = get();
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      set({ currentTrack: queue[prevIndex], queueIndex: prevIndex, isPlaying: true });
    } else {
      get().replay();
    }
  },

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => {
    const { isMuted, volume } = get();
    set({ isMuted: !isMuted, volume: isMuted ? volume : 0 });
  },

  setQueue: (queue) => set({ queue }),

  addToQueue: (track) => {
    const { queue } = get();
    if (!queue.find((t) => t.id === track.id)) {
      set({ queue: [...queue, track] });
    }
  },

  playNext: (track) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    if (!newQueue.find((t) => t.id === track.id)) {
      newQueue.splice(queueIndex + 1, 0, track);
      set({ queue: newQueue });
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

  setRepeat: (mode) => set({ repeat: mode }),

  cycleRepeat: () => {
    const { repeat } = get();
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const idx = modes.indexOf(repeat);
    set({ repeat: modes[(idx + 1) % modes.length] });
  },

  toggleAutoPlay: () => set((s) => ({ autoPlay: !s.autoPlay })),

  toggleShuffle: () => {
    const { shuffle, queue, queueIndex, currentTrack } = get();
    const newShuffle = !shuffle;
    if (newShuffle) {
      const remaining = queue.slice(queueIndex + 1);
      const shuffled = shuffleArray(remaining);
      const newQueue = [currentTrack!, ...shuffled].filter(Boolean);
      set({ shuffle: true, queue: newQueue, queueIndex: 0 });
    } else {
      set({ shuffle: false });
    }
  },

  getUpNext: () => {
    const { queue, queueIndex } = get();
    return queue.slice(queueIndex + 1);
  },
}));
