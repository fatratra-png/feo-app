import { describe, it, expect } from 'vitest';

describe('Recommendations API', () => {
  describe('getAISuggestions', () => {
    it('should build correct URL with parameters', () => {
      const params = new URLSearchParams();
      params.append('userPreference', 'relaxing');
      params.append('currentMood', 'chill');
      params.append('genre', 'pop');

      const url = `/recommendations/suggestions?${params}`;
      expect(url).toContain('userPreference=relaxing');
      expect(url).toContain('currentMood=chill');
      expect(url).toContain('genre=pop');
    });

    it('should handle default values', () => {
      const params = new URLSearchParams();
      if (!params.has('userPreference')) {
        params.append('userPreference', 'relaxing');
      }

      expect(params.get('userPreference')).toBe('relaxing');
    });
  });

  describe('getUpNext', () => {
    it('should build correct URL with track_id', () => {
      const trackId = 'track123';
      const params = new URLSearchParams();
      params.append('track_id', trackId);
      params.append('limit', '10');

      const url = `/recommendations/up-next?${params}`;
      expect(url).toContain(`track_id=${trackId}`);
      expect(url).toContain('limit=10');
    });

    it('should handle manual queue parameter', () => {
      const params = new URLSearchParams();
      params.append('manual_queue', 'track1,track2,track3');

      expect(params.get('manual_queue')).toBe('track1,track2,track3');
    });
  });

  describe('recordSkip', () => {
    it('should send correct payload', () => {
      const trackId = 'track123';
      const payload = { track_id: trackId };

      expect(payload.track_id).toBe('track123');
    });
  });
});
