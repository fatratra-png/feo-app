import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlayerStore } from '../src/stores/playerStore';

describe('Player Store', () => {
  beforeEach(() => {
    // Reset store before each test
    localStorage.clear();
  });

  describe('Play and Pause', () => {
    it('should pause the current track', () => {
      const store = usePlayerStore.getState();
      store.isPlaying = true;
      store.pause();
      expect(store.isPlaying).toBe(false);
    });

    it('should resume playing', () => {
      const store = usePlayerStore.getState();
      store.isPlaying = false;
      store.resume();
      expect(store.isPlaying).toBe(true);
    });
  });

  describe('Next and Previous', () => {
    it('should cycle repeat modes', () => {
      const store = usePlayerStore.getState();
      expect(store.repeat).toBe('off');

      store.cycleRepeat();
      expect(store.repeat).toBe('one');

      store.cycleRepeat();
      expect(store.repeat).toBe('all');

      store.cycleRepeat();
      expect(store.repeat).toBe('off');
    });

    it('should toggle shuffle', () => {
      const store = usePlayerStore.getState();
      const initialShuffle = store.shuffle;
      store.toggleShuffle();
      expect(store.shuffle).toBe(!initialShuffle);
    });

    it('should toggle autoplay', () => {
      const store = usePlayerStore.getState();
      const initialAutoPlay = store.autoPlay;
      store.toggleAutoPlay();
      expect(store.autoPlay).toBe(!initialAutoPlay);
    });
  });

  describe('Queue Management', () => {
    it('should add track to queue', () => {
      const store = usePlayerStore.getState();
      store.queue = [];

      const track = {
        id: 'track1',
        title: 'Test Track',
        duration: 180,
        file_url: null,
        artist_name: 'Artist',
        album_title: 'Album',
        album_cover_url: null,
      };

      store.addToQueue(track);
      expect(store.queue).toHaveLength(1);
      expect(store.queue[0].id).toBe('track1');
    });

    it('should not add duplicate tracks to queue', () => {
      const store = usePlayerStore.getState();
      store.queue = [];

      const track = {
        id: 'track1',
        title: 'Test Track',
        duration: 180,
        file_url: null,
        artist_name: 'Artist',
        album_title: 'Album',
        album_cover_url: null,
      };

      store.addToQueue(track);
      store.addToQueue(track);
      expect(store.queue).toHaveLength(1);
    });

    it('should clear the queue', () => {
      const store = usePlayerStore.getState();
      store.queue = [
        {
          id: 'track1',
          title: 'Track 1',
          duration: 180,
          file_url: null,
          artist_name: 'Artist',
          album_title: 'Album',
          album_cover_url: null,
        },
      ];
      store.currentTrack = store.queue[0];

      store.clearQueue();
      expect(store.queue).toHaveLength(0);
      expect(store.currentTrack).toBeNull();
      expect(store.isPlaying).toBe(false);
    });

    it('should remove track from queue', () => {
      const store = usePlayerStore.getState();
      const track1 = {
        id: 'track1',
        title: 'Track 1',
        duration: 180,
        file_url: null,
        artist_name: 'Artist',
        album_title: 'Album',
        album_cover_url: null,
      };
      const track2 = {
        id: 'track2',
        title: 'Track 2',
        duration: 200,
        file_url: null,
        artist_name: 'Artist',
        album_title: 'Album',
        album_cover_url: null,
      };

      store.queue = [track1, track2];
      store.removeFromQueue('track1');
      expect(store.queue).toHaveLength(1);
      expect(store.queue[0].id).toBe('track2');
    });
  });

  describe('Volume Control', () => {
    it('should set volume', () => {
      const store = usePlayerStore.getState();
      store.setVolume(0.5);
      expect(store.volume).toBe(0.5);
    });

    it('should toggle mute', () => {
      const store = usePlayerStore.getState();
      store.setVolume(0.7);
      store.toggleMute();
      expect(store.isMuted).toBe(true);
      expect(store.volume).toBe(0);

      store.toggleMute();
      expect(store.isMuted).toBe(false);
      expect(store.volume).toBe(0.7);
    });
  });

  describe('Progress Tracking', () => {
    it('should set progress', () => {
      const store = usePlayerStore.getState();
      store.setProgress(45.5);
      expect(store.progress).toBe(45.5);
    });

    it('should seek to position', () => {
      const store = usePlayerStore.getState();
      store.seekTo(60);
      expect(store.progress).toBe(60);
    });
  });

  describe('Repeat Modes', () => {
    it('should set repeat mode', () => {
      const store = usePlayerStore.getState();
      store.setRepeat('one');
      expect(store.repeat).toBe('one');

      store.setRepeat('all');
      expect(store.repeat).toBe('all');

      store.setRepeat('off');
      expect(store.repeat).toBe('off');
    });
  });
});
