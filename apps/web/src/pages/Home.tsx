import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi, libraryApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { usePlayerStore } from '../stores/playerStore';

const CATEGORIES = [
  { id: 'pop', label: 'Pop', color: 'bg-brutal-pink', shadow: 'brutal-shadow-pink' },
  { id: 'hiphop', label: 'Hip Hop', color: 'bg-brutal-orange', shadow: 'brutal-shadow-orange' },
  { id: 'rnb', label: 'R&B', color: 'bg-brutal-purple', shadow: 'brutal-shadow-purple' },
  { id: 'rock', label: 'Rock', color: 'bg-brutal-red', shadow: 'brutal-shadow-red' },
  { id: 'electronic', label: 'Electronic', color: 'bg-brutal-teal', shadow: 'brutal-shadow-teal' },
  { id: 'jazz', label: 'Jazz', color: 'bg-brutal-blue', shadow: 'brutal-shadow-blue' },
  { id: 'classical', label: 'Classical', color: 'bg-brutal-green', shadow: 'brutal-shadow-green' },
  { id: 'afro', label: 'Afro', color: 'bg-brutal-yellow', shadow: 'brutal-shadow-yellow' },
  { id: 'latin', label: 'Latino', color: 'bg-brutal-pink', shadow: 'brutal-shadow-pink' },
  { id: 'reggae', label: 'Reggae', color: 'bg-brutal-green', shadow: 'brutal-shadow-green' },
];

export function Home() {
  const [activeCat, setActiveCat] = useState('pop');

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['yt-trending', activeCat],
    queryFn: () => youtubeApi.trending(activeCat),
  });

  const { data: homeData } = useQuery({
    queryKey: ['home'],
    queryFn: libraryApi.getHome,
  });

  const heroTracks = trending?.tracks?.slice(0, 3) || [];

  return (
    <div className="p-10 space-y-20 max-w-6xl mx-auto">
      {heroTracks.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {heroTracks.map((track: any, i: number) => {
            const colors = ['bg-brutal-yellow', 'bg-brutal-pink', 'bg-brutal-blue'];
            const shadows = ['brutal-shadow-yellow', 'brutal-shadow-pink', 'brutal-shadow-blue'];
            return (
              <div
                key={track.id}
                className={`${colors[i]} brutal-border ${shadows[i]} p-8 cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1`}
                onClick={() => usePlayerStore.getState().play(track)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 brutal-border-thin text-xs mb-3 bg-white dark:bg-[#1a1a1a]">
                      {i === 0 ? 'Hot Pick' : i === 1 ? 'Trending' : 'Fresh'}
                    </span>
                    <h3 className="text-xl font-black uppercase mt-1 leading-tight truncate">{track.title}</h3>
                    <p className="text-sm font-mono mt-1.5 opacity-70 truncate">{track.artist_name}</p>
                    <span className="inline-block mt-4 metadata-tag text-[9px] bg-black text-white border-black">
                      &#9654; Play Now
                    </span>
                  </div>
                  {track.album_cover_url && (
                    <div className="relative flex-shrink-0">
                      <img src={track.album_cover_url} alt="" className="w-24 h-24 brutal-border-thin object-cover" />
                      <span className="absolute -top-2.5 -right-2.5 metadata-tag text-[8px] bg-brutal-red text-white border-white">YT</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Genre category pills */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <span className="section-index text-sm font-bold opacity-40">01</span>
          <h2 className="text-3xl font-black uppercase tracking-tight">Browse Music</h2>
          <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`${cat.color} brutal-border ${cat.shadow} px-6 py-4 font-black uppercase text-sm transition-all hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 ${
                activeCat === cat.id ? 'ring-3 ring-black scale-105 z-10' : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <span className="section-index text-sm font-bold opacity-40">02</span>
          <h2 className="text-3xl font-black uppercase tracking-tight">
            <span className="text-brutal-red">&#9679;</span> Trending Now
          </h2>
          <span className="metadata-tag text-[9px]">{activeCat.toUpperCase()}</span>
          <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
        </div>
        {trendingLoading ? (
          <div className="flex items-center gap-3 py-8">
            <span className="w-5 h-5 brutal-border-thin animate-spin border-t-transparent" />
            <p className="font-mono text-sm opacity-50">Loading trending tracks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {trending?.tracks?.slice(0, 12).map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Played */}
      {homeData?.recentlyPlayed?.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="section-index text-sm font-bold opacity-40">03</span>
            <h2 className="text-3xl font-black uppercase tracking-tight">Recently Played</h2>
            <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {homeData.recentlyPlayed.slice(0, 8).map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Playlists */}
      {homeData?.featuredPlaylists?.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-8">
            <span className="section-index text-sm font-bold opacity-40">04</span>
            <h2 className="text-3xl font-black uppercase tracking-tight">Featured Playlists</h2>
            <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {homeData.featuredPlaylists.map((pl: any) => (
              <a
                key={pl.id}
                href={`/playlists/${pl.id}`}
                className="brutal-card p-5 block transition-all hover:-translate-x-1 hover:-translate-y-1"
              >
                <div className="w-full aspect-square brutal-border-thin mb-4 flex items-center justify-center bg-brutal-yellow text-3xl font-black">
                  &#9834;
                </div>
                <p className="font-black text-sm uppercase truncate leading-tight">{pl.name}</p>
                <p className="text-xs font-mono opacity-40 mt-1.5">{pl.tracks_count || 0} tracks</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}