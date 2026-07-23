import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { useDebounce } from '../hooks/useDebounce';

const SUGGESTIONS = ['pop hits 2024', 'hip hop vibes', 'jazz relax', 'rock classics', 'electronic dance', 'afrobeat', 'latin party', 'reggae chill'];

export function Search() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 600);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => youtubeApi.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const searching = isLoading || isFetching;

  return (
    <div className="p-10 space-y-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <span className="section-index text-lg">&#8999;</span>
        <h1 className="text-4xl font-black uppercase tracking-tight">Search</h1>
        <span className="metadata-tag text-[9px]">Ctrl + K</span>
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
          className="brutal-input w-full px-8 py-6 text-2xl font-black uppercase tracking-wide"
          autoFocus
        />
        {showSuggestions && query.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 brutal-border bg-[#1e1e1e] z-10 p-5 shadow-[6px_6px_0px_#222]">
            <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-40 mb-4">Try searching</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => { setQuery(s); setShowSuggestions(false); }}
                  className="metadata-tag text-xs px-4 py-2 cursor-pointer hover:bg-brutal-yellow hover:text-black transition-colors font-bold"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searching && (
        <div className="flex items-center gap-3 py-6">
          <span className="w-6 h-6 brutal-border-thin animate-spin border-t-transparent" />
          <p className="font-mono text-sm opacity-50">Searching worldwide...</p>
        </div>
      )}

      {data?.tracks?.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="section-index text-sm font-bold opacity-40">01</span>
            <h2 className="text-2xl font-black uppercase tracking-tight">Results</h2>
            <span className="metadata-tag text-[9px]">{data.tracks.length} tracks found</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="space-y-3">
            {data.tracks.map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}

      {!searching && debouncedQuery.length > 0 && data?.tracks?.length === 0 && (
        <div className="brutal-border bg-brutal-yellow text-black p-10 text-center max-w-xl mx-auto">
          <p className="text-2xl font-black uppercase">No Results</p>
          <p className="text-sm font-mono mt-3 opacity-70">Try a different search term or check your spelling</p>
        </div>
      )}

      {debouncedQuery.length === 0 && !searching && (
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="section-index text-sm font-bold opacity-40">--</span>
            <h2 className="text-2xl font-black uppercase tracking-tight">Discover Genres</h2>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SUGGESTIONS.map((s, i) => {
              const colors = ['bg-brutal-pink', 'bg-brutal-yellow', 'bg-brutal-blue', 'bg-brutal-green', 'bg-brutal-purple', 'bg-brutal-orange', 'bg-brutal-red', 'bg-brutal-teal'];
              const shadows = ['brutal-shadow-pink', 'brutal-shadow-yellow', 'brutal-shadow-blue', 'brutal-shadow-green', 'brutal-shadow-purple', 'brutal-shadow-orange', 'brutal-shadow-red', 'brutal-shadow-teal'];
              return (
                <button
                  key={s}
                  onMouseDown={() => setQuery(s)}
                  className={`${colors[i]} brutal-border ${shadows[i]} p-8 font-black uppercase text-base text-left text-black transition-all hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1`}
                >
                  <span className="text-xs font-mono font-bold opacity-40 block mb-2">0{i + 1}</span>
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