import { create } from 'zustand';

interface Track {
  id: string;
  title: string;
  duration: number;
  file_url: string | null;
  artist_name: string;
  album_title: string;
  album_cover_url: string | null;
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  queueIndex: number;
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: parseFloat(localStorage.getItem('feo_volume') || '0.7'),
  progress: 0,
  queueIndex: -1,

  play: (track, queue) => {
    const currentQueue = queue || get().queue;
    const index = currentQueue.findIndex((t) => t.id === track.id);
    set({
      currentTrack: track,
      queue: currentQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
      progress: 0,
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      set({
        currentTrack: queue[nextIndex],
        queueIndex: nextIndex,
        isPlaying: true,
        progress: 0,
      });
    } else {
      set({ isPlaying: false, currentTrack: null, queueIndex: -1 });
    }
  },

  previous: () => {
    const { queue, queueIndex } = get();
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      set({
        currentTrack: queue[prevIndex],
        queueIndex: prevIndex,
        isPlaying: true,
        progress: 0,
      });
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
    const { queue } = get();
    set({ queue: queue.filter((t) => t.id !== trackId) });
  },

  clearQueue: () => set({ queue: [], queueIndex: -1, currentTrack: null, isPlaying: false }),
}));