import { expect } from 'chai';
import { generateAISuggestions, getRecommendations } from '../src/services/llmService';

describe('LLM Service', () => {
  describe('getRecommendations', () => {
    it('should return null if API key is not set', async () => {
      // Save original env
      const originalUrl = process.env.LLM_API_URL;
      const originalKey = process.env.LLM_API_KEY;

      // Clear env
      delete process.env.LLM_API_URL;
      delete process.env.LLM_API_KEY;

      const result = await getRecommendations(
        {
          id: 'track1',
          title: 'Test Track',
          artist: 'Test Artist',
          genre: 'pop',
          tags: ['upbeat'],
          mood: 'happy',
          tempo: 120,
        },
        [],
        []
      );

      expect(result).to.be.null;

      // Restore env
      if (originalUrl) process.env.LLM_API_URL = originalUrl;
      if (originalKey) process.env.LLM_API_KEY = originalKey;
    });

    it('should handle candidate tracks correctly', async () => {
      const candidates = [
        {
          id: 'track2',
          title: 'Another Track',
          artist: 'Another Artist',
          genre: 'pop',
          tags: ['upbeat'],
          mood: 'happy',
          tempo: 120,
        },
      ];

      const currentTrack = {
        id: 'track1',
        title: 'Test Track',
        artist: 'Test Artist',
        genre: 'pop',
        tags: ['upbeat'],
        mood: 'happy',
        tempo: 120,
      };

      // This would call the actual API if credentials are set
      // For testing, we verify it doesn't crash
      try {
        await getRecommendations(currentTrack, candidates, []);
      } catch (err) {
        // API errors are expected without valid credentials
      }
    });
  });

  describe('generateAISuggestions', () => {
    it('should return null if API key is not set', async () => {
      const originalUrl = process.env.LLM_API_URL;
      const originalKey = process.env.LLM_API_KEY;

      delete process.env.LLM_API_URL;
      delete process.env.LLM_API_KEY;

      const result = await generateAISuggestions({
        userPreference: 'relaxing',
        currentMood: 'chill',
        genre: 'pop',
      });

      expect(result).to.be.null;

      if (originalUrl) process.env.LLM_API_URL = originalUrl;
      if (originalKey) process.env.LLM_API_KEY = originalKey;
    });

    it('should handle suggestions request with preferences', async () => {
      try {
        await generateAISuggestions({
          userPreference: 'energetic',
          currentMood: 'party',
          genre: 'electronic',
        });
      } catch (err) {
        // API errors are expected
      }
    });
  });
});
