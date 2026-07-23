import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { youtubeApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const SUGGESTIONS = ['pop hits 2024', 'hip hop vibes', 'jazz relax', 'rock classics', 'electronic dance', 'afrobeat', 'latin party', 'reggae chill'];

const PILL_COLORS = [
  { bg: 'bg-saffron/15', border: 'border-saffron', text: 'text-saffron', shadow: 'brutal-shadow-saffron' },
  { bg: 'bg-blush/15', border: 'border-blush', text: 'text-blush', shadow: 'brutal-shadow-blush' },
  { bg: 'bg-mint/15', border: 'border-mint', text: 'text-mint', shadow: 'brutal-shadow-mint' },
  { bg: 'bg-saffron/15', border: 'border-saffron', text: 'text-saffron', shadow: 'brutal-shadow-saffron' },
  { bg: 'bg-blush/15', border: 'border-blush', text: 'text-blush', shadow: 'brutal-shadow-blush' },
  { bg: 'bg-mint/15', border: 'border-mint', text: 'text-mint', shadow: 'brutal-shadow-mint' },
  { bg: 'bg-saffron/15', border: 'border-saffron', text: 'text-saffron', shadow: 'brutal-shadow-saffron' },
  { bg: 'bg-blush/15', border: 'border-blush', text: 'text-blush', shadow: 'brutal-shadow-blush' },
];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 600);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => youtubeApi.search(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const searching = isLoading || isFetching;
  const hasQuery = query.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 pt-20 sm:pt-28 pb-24">
      <div className={`w-full flex flex-col items-center ${hasQuery ? 'max-w-7xl' : 'max-w-xl'}`}>
        <div className="w-full flex flex-col items-center max-w-xl">
          <div className="mb-10 sm:mb-14 text-center">
            <h1 className="font-display text-6xl sm:text-8xl md:text-9xl font-extrabold tracking-[-0.04em] leading-none hover:tracking-[-0.02em] transition-all duration-500">
              <span className="text-saffron">F</span>
              <span className="text-blush">E</span>
              <span className="text-mint">O</span>
              <span className="text-foreground">.</span>
            </h1>
            <p className="mt-3 font-mono text-[10px] sm:text-xs tracking-[0.3em] text-foreground/25 uppercase">Henoy ara</p>
          </div>

          <div className="relative w-full mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-foreground/20 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
              placeholder="Search millions of songs..."
              className="w-full rounded-full border-2 border-border bg-muted/10 pl-14 pr-14 py-3.5 sm:py-4 text-base sm:text-lg font-display font-bold tracking-tight placeholder:text-foreground/20 text-foreground outline-none focus:border-saffron focus:bg-muted/20 focus:brutal-shadow-saffron transition-all"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-foreground/20 pointer-events-none hidden sm:block bg-muted/30 px-2 py-1 rounded-full border border-border">&#8984;K</span>
          </div>

          {!hasQuery && !searching && (
            <>
              <p className="font-mono text-[10px] text-foreground/30 uppercase tracking-[0.2em] mb-5">Try searching</p>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-lg">
                {SUGGESTIONS.map((s, i) => {
                  const c = PILL_COLORS[i];
                  return (
                    <button
                      key={s}
                      onClick={() => setSearchParams({ q: s }, { replace: true })}
                      className={`rounded-full border-2 ${c.border} ${c.bg} ${c.text} px-5 py-2.5 sm:px-6 sm:py-3 text-xs font-mono font-semibold transition-all active:translate-y-[2px] ${c.shadow} hover:opacity-80 ${
                        i % 3 === 0 ? '-rotate-1' : i % 3 === 1 ? 'rotate-1' : ''
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {searching && (
          <div className="flex items-center gap-3 py-12">
            <span className="size-10 rounded-full border-2 border-border flex items-center justify-center brutal-shadow-sm animate-pulse">
              <span className="size-4 border-2 border-saffron border-t-transparent rounded-full animate-spin" />
            </span>
            <p className="font-mono text-sm text-foreground/50">Searching worldwide...</p>
          </div>
        )}

        {data?.tracks?.length > 0 && (
          <div className="w-full mt-4 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-number brutal-shadow-sm">01</span>
              <h2 className="font-display text-xl font-extrabold tracking-[-0.02em]">Results</h2>
              <span className="chip text-[8px] bg-saffron/15 text-saffron border-saffron">{data.tracks.length} tracks</span>
              <span className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-saffron via-blush to-mint" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {data.tracks.map((track: any, i: number) => (
                <div key={track.id} className="animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                  <TrackCard track={track} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {!searching && hasQuery && data?.tracks?.length === 0 && (
          <div className="rounded-2xl border-2 border-foreground bg-saffron text-black p-10 sm:p-12 text-center max-w-md mx-auto -rotate-1 mt-10 brutal-shadow-ink">
            <p className="font-display text-2xl sm:text-3xl font-extrabold">No Results</p>
            <p className="text-xs sm:text-sm font-mono mt-4 text-black/70">Try a different search term or check your spelling</p>
            <div className="mt-6 h-1 w-12 bg-black mx-auto rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
