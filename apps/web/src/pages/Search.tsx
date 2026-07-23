import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';

const SUGGESTIONS = ['pop hits 2024', 'hip hop vibes', 'jazz relax', 'rock classics', 'electronic dance', 'afrobeat', 'latin party', 'reggae chill'];

export function Search() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => youtubeApi.search(query),
    enabled: query.length > 0,
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="section-index text-lg">&#8999;</span>
        <h1 className="text-3xl font-black uppercase tracking-tight">Search</h1>
        <span className="metadata-tag text-[9px]">Ctrl+K</span>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search millions of songs worldwide..."
          className="brutal-input w-full px-6 py-5 text-xl bg-white dark:bg-[#1a1a1a] font-bold uppercase tracking-wide"
          autoFocus
        />
        {showSuggestions && query.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 brutal-border bg-white dark:bg-[#1a1a1a] z-10 p-3">
            <p className="text-xs font-mono opacity-50 mb-2 uppercase tracking-wider">Try searching</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => { setQuery(s); setShowSuggestions(false); }}
                  className="metadata-tag text-xs px-3 py-1.5 cursor-pointer hover:bg-brutal-yellow transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 brutal-border-thin animate-spin border-t-transparent" />
          <p className="font-mono text-sm opacity-50">searching worldwide...</p>
        </div>
      )}

      {data?.tracks?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">01</span>
            <h2 className="text-xl font-black uppercase">Results</h2>
            <span className="metadata-tag text-[9px]">{data.tracks.length} tracks</span>
          </div>
          <div className="space-y-2">
            {data.tracks.map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}

      {!isLoading && query.length > 0 && data?.tracks?.length === 0 && (
        <div className="brutal-border bg-brutal-yellow p-8 text-center">
          <p className="text-2xl font-black uppercase">No results found</p>
          <p className="text-sm font-mono mt-2 opacity-70">try a different search term</p>
        </div>
      )}

      {query.length === 0 && !isLoading && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">--</span>
            <h2 className="text-xl font-black uppercase">Discover Genres</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SUGGESTIONS.map((s, i) => {
              const colors = ['bg-brutal-pink', 'bg-brutal-yellow', 'bg-brutal-blue', 'bg-brutal-green', 'bg-brutal-purple', 'bg-brutal-orange', 'bg-brutal-red', 'bg-brutal-teal'];
              const shadows = ['brutal-shadow-pink', 'brutal-shadow-yellow', 'brutal-shadow-blue', 'brutal-shadow-green', 'brutal-shadow-purple', 'brutal-shadow-orange', 'brutal-shadow-red', 'brutal-shadow-teal'];
              return (
                <button
                  key={s}
                  onMouseDown={() => setQuery(s)}
                  className={`${colors[i]} brutal-border ${shadows[i]} p-5 font-bold uppercase text-sm text-left transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5`}
                >
                  <span className="text-xs font-mono opacity-50 block mb-1">0{i + 1}</span>
                  {s}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}