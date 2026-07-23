import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { useState } from 'react';

type Tab = 'playlists' | 'liked' | 'history';

export function Library() {
  const [tab, setTab] = useState<Tab>('playlists');

  const { data, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: libraryApi.getLibrary,
  });

  if (isLoading) {
    return (
      <div className="p-10">
        <div className="flex items-center gap-3 py-8">
          <span className="w-6 h-6 brutal-border-thin animate-spin border-t-transparent" />
          <p className="font-mono text-sm opacity-50">Loading library...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count: number; color: string; shadow: string }[] = [
    { id: 'playlists', label: 'Playlists', count: data?.playlists?.length || 0, color: 'bg-brutal-yellow', shadow: 'brutal-shadow-yellow' },
    { id: 'liked', label: 'Liked', count: data?.likedTracks?.length || 0, color: 'bg-brutal-pink', shadow: 'brutal-shadow-pink' },
    { id: 'history', label: 'History', count: data?.history?.length || 0, color: 'bg-brutal-blue', shadow: 'brutal-shadow-blue' },
  ];

  return (
    <div className="p-10 space-y-12 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <span className="section-index text-lg">&#9776;</span>
        <h1 className="text-4xl font-black uppercase tracking-tight">Your Library</h1>
      </div>

      <div className="flex gap-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`${t.color} brutal-border ${t.shadow} px-6 py-4 font-black uppercase text-sm transition-all hover:-translate-x-1 hover:-translate-y-1 active:translate-x-1 active:translate-y-1 ${
              tab === t.id ? 'ring-3 ring-black' : ''
            }`}
          >
            {t.label}
            <span className="ml-3 metadata-tag text-[9px] bg-black text-white border-black">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'playlists' && (
        <section>
          {data?.playlists?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.playlists.map((pl: any) => (
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
          ) : (
            <div className="brutal-border bg-brutal-yellow p-10 max-w-lg text-center">
              <p className="text-xl font-black uppercase">No playlists yet</p>
              <p className="text-sm font-mono mt-3 opacity-70">Create one from the player&#8217;s queue menu</p>
            </div>
          )}
        </section>
      )}

      {tab === 'liked' && (
        <section>
          {data?.likedTracks?.length > 0 ? (
            <div className="space-y-3">
              {data.likedTracks.map((track: any, i: number) => (
                <TrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          ) : (
            <div className="brutal-border bg-brutal-pink p-10 max-w-lg text-center">
              <p className="text-xl font-black uppercase">No liked tracks</p>
              <p className="text-sm font-mono mt-3 opacity-70">Tap the heart icon on any track</p>
            </div>
          )}
        </section>
      )}

      {tab === 'history' && (
        <section>
          {data?.history?.length > 0 ? (
            <div className="space-y-3">
              {data.history.slice(0, 30).map((item: any, i: number) => (
                <TrackCard key={item.id} track={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="brutal-border bg-brutal-blue text-white dark:text-white p-10 max-w-lg text-center">
              <p className="text-xl font-black uppercase">No history yet</p>
              <p className="text-sm font-mono mt-3 opacity-70">Start listening to see your tracks here</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}