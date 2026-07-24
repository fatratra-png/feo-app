import { useState, useEffect } from 'react';
import { Sparkles, Search, Loader } from 'lucide-react';
import { recommendationsApi } from '../lib/api';
import { searchApi } from '../lib/api';
import { usePlayerStore } from '../stores/playerStore';

interface Suggestion {
  query: string;
  explanation: string;
}

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [userPreference, setUserPreference] = useState('relaxing');
  const [currentMood, setCurrentMood] = useState('chill');
  const [genre, setGenre] = useState('any');
  const { queue, addToQueue, currentTrack } = usePlayerStore();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const data = await recommendationsApi.getAISuggestions(userPreference, currentMood, genre);
      setSuggestions(data.suggestions || data.fallback || []);
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
      setSuggestions([
        { query: 'trending music', explanation: 'Popular tracks right now' },
        { query: 'relaxing ambient', explanation: 'Chill background music' },
        { query: 'focus beats', explanation: 'Music for concentration' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearching(true);
    try {
      const results = await searchApi.search(query);
      const tracks = results.tracks || [];
      if (tracks.length > 0) {
        // Play the first result
        const firstTrack = tracks[0];
        usePlayerStore.getState().play(firstTrack, tracks);
        
        // Rest of tracks added to queue
        tracks.slice(1).forEach((track: any) => addToQueue(track));
        
        // Trigger AI recommendations based on new track
        await usePlayerStore.getState().populateQueueWithRecommendations(firstTrack);
        
        alert(`Added ${tracks.length} tracks to queue!`);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-b from-saffron/5 to-blush/5 rounded-2xl border-2 border-saffron/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-saffron" />
        <h2 className="font-bold text-lg text-foreground">AI Suggestions</h2>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-mono text-foreground/60 block mb-1">Preference</label>
          <select
            value={userPreference}
            onChange={(e) => setUserPreference(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-foreground/20 bg-card text-sm text-foreground"
          >
            <option value="relaxing">Relaxing</option>
            <option value="energetic">Energetic</option>
            <option value="focused">Focused</option>
            <option value="uplifting">Uplifting</option>
            <option value="melancholic">Melancholic</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-foreground/60 block mb-1">Mood</label>
          <select
            value={currentMood}
            onChange={(e) => setCurrentMood(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-foreground/20 bg-card text-sm text-foreground"
          >
            <option value="chill">Chill</option>
            <option value="party">Party</option>
            <option value="workout">Workout</option>
            <option value="study">Study</option>
            <option value="sleep">Sleep</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-foreground/60 block mb-1">Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-foreground/20 bg-card text-sm text-foreground"
          >
            <option value="any">Any</option>
            <option value="hip-hop">Hip-hop</option>
            <option value="electronic">Electronic</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="indie">Indie</option>
            <option value="jazz">Jazz</option>
          </select>
        </div>

        <button
          onClick={loadSuggestions}
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-saffron text-black font-bold text-sm hover:bg-saffron/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate Suggestions
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(suggestion.query)}
              disabled={searching}
              className="w-full p-3 rounded-lg border-2 border-blush bg-blush/5 hover:bg-blush/10 transition-colors text-left"
            >
              <div className="font-mono font-bold text-sm text-foreground flex items-center gap-2">
                {searching ? <Loader className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                {suggestion.query}
              </div>
              <p className="text-xs text-foreground/60 mt-1">{suggestion.explanation}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
