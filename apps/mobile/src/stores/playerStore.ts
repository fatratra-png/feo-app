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
  queueIndex: number;
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  queueIndex: -1,

  play: (track, queue) => {
    const currentQueue = queue || get().queue;
    const index = currentQueue.findIndex((t) => t.id === track.id);
    set({
      currentTrack: track,
      queue: currentQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: true,
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      set({ currentTrack: queue[nextIndex], queueIndex: nextIndex, isPlaying: true });
    } else {
      set({ isPlaying: false, currentTrack: null, queueIndex: -1 });
    }
  },

  previous: () => {
    const { queue, queueIndex } = get();
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      set({ currentTrack: queue[prevIndex], queueIndex: prevIndex, isPlaying: true });
    }
  },

  setQueue: (queue) => set({ queue }),
  addToQueue: (track) => {
    const { queue } = get();
    if (!queue.find((t) => t.id === track.id)) {
      set({ queue: [...queue, track] });
    }
  },
}));