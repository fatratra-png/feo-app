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
    enabled: !!activeCat,
  });

  const { data: homeData } = useQuery({
    queryKey: ['home'],
    queryFn: libraryApi.getHome,
  });

  const { data: ytSearch } = useQuery({
    queryKey: ['yt-hero', activeCat],
    queryFn: () => youtubeApi.search(activeCat === 'pop' ? 'popular music 2024' : `${activeCat} music mix`),
  });

  const heroTracks = ytSearch?.tracks?.slice(0, 3) || [];

  return (
    <div className="p-8 space-y-10">
      {heroTracks.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {heroTracks.map((track: any, i: number) => {
            const colors = ['bg-brutal-yellow', 'bg-brutal-pink', 'bg-brutal-blue'];
            const shadows = ['brutal-shadow-yellow', 'brutal-shadow-pink', 'brutal-shadow-blue'];
            return (
              <div
                key={track.id}
                className={`${colors[i]} brutal-border ${shadows[i]} p-6 cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5`}
                onClick={() => usePlayerStore.getState().play(track)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">
                      {i === 0 ? 'Hot Pick' : i === 1 ? 'Trending' : 'New'}
                    </span>
                    <h3 className="text-xl font-black uppercase mt-2 leading-tight truncate">{track.title}</h3>
                    <p className="text-sm font-mono mt-1 opacity-70 truncate">{track.artist_name}</p>
                    <span className="inline-block mt-3 metadata-tag text-[9px] bg-black text-white border-black">
                      PLAY NOW
                    </span>
                  </div>
                  {track.album_cover_url && (
                    <div className="relative flex-shrink-0">
                      <img src={track.album_cover_url} alt="" className="w-20 h-20 brutal-border-thin object-cover" />
                      <span className="absolute -top-2 -right-2 metadata-tag text-[8px] bg-brutal-red text-white border-white">YT</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">01</span>
          <h2 className="text-2xl font-black uppercase tracking-tight">Browse Music</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`${cat.color} brutal-border ${cat.shadow} px-5 py-3 font-bold uppercase text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 ${
                activeCat === cat.id ? 'ring-3 ring-black scale-105' : ''
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">02</span>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            <span className="text-brutal-red">&#9679;</span> Trending Now
          </h2>
          <span className="metadata-tag text-[9px]">{activeCat.toUpperCase()}</span>
        </div>
        {trendingLoading ? (
          <p className="font-mono text-sm opacity-50 animate-pulse">loading beats...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {trending?.tracks?.slice(0, 12).map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </section>

      {homeData?.recentlyPlayed?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="section-index">03</span>
            <h2 className="text-2xl font-black uppercase tracking-tight">Recently Played</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {homeData.recentlyPlayed.slice(0, 8).map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}

      {homeData?.featuredPlaylists?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="section-index">04</span>
            <h2 className="text-2xl font-black uppercase tracking-tight">Featured Playlists</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {homeData.featuredPlaylists.map((pl: any) => (
              <div key={pl.id} className="flex-shrink-0 w-48">
                <a
                  href={`/playlists/${pl.id}`}
                  className="block brutal-card bg-white dark:bg-[#1a1a1a] p-4"
                >
                  <div className="w-full aspect-square brutal-border-thin mb-3 flex items-center justify-center bg-brutal-yellow text-4xl">
                    &#9834;
                  </div>
                  <p className="font-bold text-sm truncate uppercase">{pl.name}</p>
                  <p className="text-xs font-mono opacity-50 mt-1">{pl.tracks_count || 0} tracks</p>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}