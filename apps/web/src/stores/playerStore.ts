import { create } from 'zustand';
import { api, youtubeApi } from '../lib/api';

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
  originalQueue: Track[];
  isPlaying: boolean;
  volume: number;
  previousVolume: number;
  isMuted: boolean;
  progress: number;
  queueIndex: number;
  isLoadingAudio: boolean;
  repeat: RepeatMode;
  autoPlay: boolean;
  shuffle: boolean;
  crossfade: boolean;
  crossfadeDuration: number;
  playHistory: Track[];
  gaplessPlayback: boolean;

  play: (track: Track, queue?: Track[]) => void;
  setTrackAudioUrl: (trackId: string, url: string) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  replay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setQueue: (queue: Track[]) => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  setRepeat: (mode: RepeatMode) => void;
  cycleRepeat: () => void;
  toggleAutoPlay: () => void;
  toggleShuffle: () => void;
  toggleCrossfade: () => void;
  setCrossfadeDuration: (seconds: number) => void;
  getCurrentQueuePosition: () => number;
  getUpNext: () => Track[];
  populateQueueWithRecommendations: (track: Track) => Promise<void>;
}

function fetchAudio(track: Track): Promise<string | null> {
  if (track.source !== 'youtube' || !track.youtube_id) return Promise.resolve(null);
  return youtubeApi.getAudioUrl(track.youtube_id)
    .then((data: any) => data.audioUrl || null)
    .catch(() => null);
}

function needsAudioFetch(track: Track): boolean {
  return track.source === 'youtube' && !track.file_url;
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
  originalQueue: [],
  isPlaying: false,
  volume: parseFloat(localStorage.getItem('feo_volume') || '0.7'),
  previousVolume: 0.7,
  isMuted: false,
  progress: 0,
  queueIndex: -1,
  isLoadingAudio: false,
  repeat: (localStorage.getItem('feo_repeat') as RepeatMode) || 'off',
  autoPlay: localStorage.getItem('feo_autoplay') === 'true',
  shuffle: localStorage.getItem('feo_shuffle') === 'true',
  crossfade: localStorage.getItem('feo_crossfade') === 'true',
  crossfadeDuration: parseFloat(localStorage.getItem('feo_crossfade_duration') || '3'),
  playHistory: [],
  gaplessPlayback: true,

  play: (track, queue) => {
    const state = get();
    const currentQueue = queue || state.queue;
    const index = currentQueue.findIndex((t) => t.id === track.id);
    const needsFetch = needsAudioFetch(track);

    const current = state.currentTrack;
    if (current && state.isPlaying && state.shuffle) {
      const history = [...state.playHistory];
      const existingIdx = history.findIndex(t => t.id === current.id);
      if (existingIdx === -1) history.push(current);
      set({ playHistory: history.slice(-50) });
    }

    set({
      currentTrack: track,
      queue: currentQueue,
      originalQueue: queue || state.originalQueue,
      queueIndex: index >= 0 ? index : 0,
      isPlaying: !needsFetch,
      progress: 0,
      isLoadingAudio: needsFetch,
    });

    if (needsFetch && track.youtube_id) {
      youtubeApi.getAudioUrl(track.youtube_id)
        .then((data: any) => {
          if (data.audioUrl) {
            get().setTrackAudioUrl(track.id, data.audioUrl);
            set({ isPlaying: true, isLoadingAudio: false });
          }
        })
        .catch(() => set({ isLoadingAudio: false }));
    }

    // Auto-populate queue with AI recommendations
    setTimeout(() => {
      get().populateQueueWithRecommendations(track);
    }, 500);
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

  seekTo: (time) => {
    set({ progress: time });
    const audio = document.querySelector('audio');
    if (audio) audio.currentTime = time;
  },

  next: () => {
    const { queue, queueIndex, repeat, autoPlay, currentTrack, shuffle, originalQueue } = get();
    const history = [...get().playHistory];

    if (currentTrack) {
      const existingIdx = history.findIndex(t => t.id === currentTrack.id);
      if (existingIdx === -1) history.push(currentTrack);
    }

    if (repeat === 'one' && currentTrack) {
      set({ playHistory: history.slice(-50) });
      get().replay();
      return;
    }

    let nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
        const nextTrack = queue[nextIndex];
        const needsFetch = needsAudioFetch(nextTrack);
        set({
          currentTrack: nextTrack,
          queueIndex: nextIndex,
          isPlaying: !needsFetch,
          progress: 0,
          isLoadingAudio: needsFetch,
          playHistory: history.slice(-50),
        });
        if (needsFetch && nextTrack.youtube_id) {
          youtubeApi.getAudioUrl(nextTrack.youtube_id)
            .then((data: any) => {
              if (data.audioUrl) {
                get().setTrackAudioUrl(nextTrack.id, data.audioUrl);
                set({ isPlaying: true, isLoadingAudio: false });
              }
            })
            .catch(() => set({ isLoadingAudio: false }));
        }
        return;
      } else if (autoPlay && currentTrack) {
        set({ isLoadingAudio: true, playHistory: history.slice(-50) });
        const query = `${currentTrack.title} ${currentTrack.artist_name}`;
        youtubeApi.related(query)
          .then((data: any) => {
            const tracks = data.tracks || [];
            const filtered = tracks.filter((t: any) => t.id !== currentTrack.id);
            if (filtered.length > 0) {
              const nextTrack = filtered[0];
              const newQueue = [...get().queue.filter(t => t.id !== nextTrack.id), nextTrack];
              const newOriginal = originalQueue.length > 0 ? originalQueue : newQueue;
              const needsFetch = needsAudioFetch(nextTrack);
              set({
                currentTrack: nextTrack,
                queue: newQueue,
                originalQueue: newOriginal,
                queueIndex: newQueue.length - 1,
                isPlaying: !needsFetch,
                progress: 0,
                isLoadingAudio: needsFetch,
              });
              if (needsFetch && nextTrack.youtube_id) {
                youtubeApi.getAudioUrl(nextTrack.youtube_id)
                  .then((data: any) => {
                    if (data.audioUrl) {
                      get().setTrackAudioUrl(nextTrack.id, data.audioUrl);
                      set({ isPlaying: true, isLoadingAudio: false });
                    }
                  })
                  .catch(() => set({ isLoadingAudio: false }));
              }
            } else {
              set({ isPlaying: false, isLoadingAudio: false });
            }
          })
          .catch(() => set({ isLoadingAudio: false }));
        return;
      } else {
        set({
          isPlaying: false,
          currentTrack: null,
          queueIndex: -1,
          playHistory: history.slice(-50),
        });
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
      playHistory: history.slice(-50),
    });

    if (needsFetch && nextTrack.youtube_id) {
      youtubeApi.getAudioUrl(nextTrack.youtube_id)
        .then((data: any) => {
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
        youtubeApi.getAudioUrl(prevTrack.youtube_id)
          .then((data: any) => {
            if (data.audioUrl) {
              get().setTrackAudioUrl(prevTrack.id, data.audioUrl);
              set({ isPlaying: true, isLoadingAudio: false });
            }
          })
          .catch(() => set({ isLoadingAudio: false }));
      }
    } else {
      get().replay();
    }
  },

  setVolume: (volume) => {
    localStorage.setItem('feo_volume', String(volume));
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume, previousVolume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: previousVolume || 0.7 });
      localStorage.setItem('feo_volume', String(previousVolume || 0.7));
    } else {
      set({ isMuted: true, previousVolume: volume, volume: 0 });
    }
  },

  setProgress: (progress) => set({ progress }),
  setQueue: (queue) => set({ queue, originalQueue: queue }),

  addToQueue: (track) => {
    const { queue } = get();
    if (!queue.find((t) => t.id === track.id)) {
      set({ queue: [...queue, track] });
    }
  },

  playNext: (track) => {
    const { queue, queueIndex } = get();
    const insertAt = queueIndex + 1;
    const newQueue = [...queue];
    if (!newQueue.find((t) => t.id === track.id)) {
      newQueue.splice(insertAt, 0, track);
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
      set({
        queue: newQueue,
        currentTrack: newQueue[newIndex] || null,
        queueIndex: Math.min(newIndex, newQueue.length - 1),
        isPlaying: !!newQueue[newIndex],
      });
    } else {
      set({ queue: newQueue, queueIndex: newIndex });
    }
  },

  clearQueue: () => set({
    queue: [],
    originalQueue: [],
    queueIndex: -1,
    currentTrack: null,
    isPlaying: false,
    playHistory: [],
  }),

  reorderQueue: (fromIndex, toIndex) => {
    const { queue } = get();
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);
    let { queueIndex } = get();
    if (fromIndex === queueIndex) {
      queueIndex = toIndex;
    } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
      queueIndex--;
    } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
      queueIndex++;
    }
    set({ queue: newQueue, queueIndex });
  },

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

  toggleShuffle: () => {
    const { shuffle, queue, queueIndex, currentTrack } = get();
    const newShuffle = !shuffle;
    localStorage.setItem('feo_shuffle', String(newShuffle));

    if (newShuffle) {
      const remaining = queue.slice(queueIndex + 1);
      const shuffled = shuffleArray(remaining);
      const newQueue = [currentTrack!, ...shuffled].filter(Boolean);
      set({ shuffle: true, queue: newQueue, queueIndex: 0 });
    } else {
      set({ shuffle: false });
    }
  },

  toggleCrossfade: () => {
    const { crossfade } = get();
    localStorage.setItem('feo_crossfade', String(!crossfade));
    set({ crossfade: !crossfade });
  },

  setCrossfadeDuration: (seconds) => {
    localStorage.setItem('feo_crossfade_duration', String(seconds));
    set({ crossfadeDuration: seconds });
  },

  getCurrentQueuePosition: () => {
    return get().queueIndex;
  },

  getUpNext: () => {
    const { queue, queueIndex } = get();
    return queue.slice(queueIndex + 1);
  },

  populateQueueWithRecommendations: async (track: Track) => {
    try {
      const response = await api(`/recommendations/up-next?track_id=${track.id}&limit=15`);
      const recommendedTracks = response.tracks || [];

      // Filter out current track
      const filtered = recommendedTracks.filter((t: any) => t.id !== track.id);

      if (filtered.length > 0) {
        // Merge with existing queue, avoiding duplicates
        const currentQueue = get().queue;
        const newTracks = filtered.filter((t: any) => !currentQueue.find(q => q.id === t.id));
        
        if (newTracks.length > 0) {
          const updatedQueue = [...currentQueue, ...newTracks].slice(0, 50); // Cap at 50 tracks
          set({ queue: updatedQueue });
        }
      }
    } catch (err) {
      console.error('Failed to populate queue:', err);
    }
  },
}));
