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

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  queueIndex: number;
  isLoadingAudio: boolean;
  play: (track: Track, queue?: Track[]) => void;
  setTrackAudioUrl: (trackId: string, url: string) => void;
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
  isLoadingAudio: false,

  play: (track, queue) => {
    const currentQueue = queue || get().queue;
    const index = currentQueue.findIndex((t) => t.id === track.id);
    const needsAudioFetch = track.source === 'youtube' && !track.file_url;

    set({
      currentTrack: track,
      queue: currentQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: !needsAudioFetch,
      progress: 0,
      isLoadingAudio: needsAudioFetch,
    });

    if (needsAudioFetch && track.youtube_id) {
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
    set({
      queue: queue.map((t) => (t.id === trackId ? { ...t, file_url: url } : t)),
    });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  next: () => {
    const { queue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      const nextTrack = queue[nextIndex];
      const needsAudioFetch = nextTrack.source === 'youtube' && !nextTrack.file_url;
      set({
        currentTrack: nextTrack,
        queueIndex: nextIndex,
        isPlaying: !needsAudioFetch,
        progress: 0,
        isLoadingAudio: needsAudioFetch,
      });
      if (needsAudioFetch && nextTrack.youtube_id) {
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
    } else {
      set({ isPlaying: false, currentTrack: null, queueIndex: -1 });
    }
  },

  previous: () => {
    const { queue, queueIndex } = get();
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      const prevTrack = queue[prevIndex];
      const needsAudioFetch = prevTrack.source === 'youtube' && !prevTrack.file_url;
      set({
        currentTrack: prevTrack,
        queueIndex: prevIndex,
        isPlaying: !needsAudioFetch,
        progress: 0,
        isLoadingAudio: needsAudioFetch,
      });
      if (needsAudioFetch && prevTrack.youtube_id) {
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
    const { queue } = get();
    set({ queue: queue.filter((t) => t.id !== trackId) });
  },

  clearQueue: () => set({ queue: [], queueIndex: -1, currentTrack: null, isPlaying: false }),
}));