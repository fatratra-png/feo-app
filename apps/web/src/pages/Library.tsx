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
      <div className="p-8">
        <p className="font-mono text-sm opacity-50 animate-pulse">loading library...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count: number; color: string; shadow: string }[] = [
    { id: 'playlists', label: 'Playlists', count: data?.playlists?.length || 0, color: 'bg-brutal-yellow', shadow: 'brutal-shadow-yellow' },
    { id: 'liked', label: 'Liked Tracks', count: data?.likedTracks?.length || 0, color: 'bg-brutal-pink', shadow: 'brutal-shadow-pink' },
    { id: 'history', label: 'History', count: data?.history?.length || 0, color: 'bg-brutal-blue', shadow: 'brutal-shadow-blue' },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="section-index text-lg">&#9776;</span>
        <h1 className="text-3xl font-black uppercase tracking-tight">Your Library</h1>
      </div>

      <div className="flex gap-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`${t.color} brutal-border ${t.shadow} px-5 py-3 font-bold uppercase text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 ${
              tab === t.id ? 'ring-3 ring-black' : ''
            }`}
          >
            {t.label}
            <span className="ml-2 metadata-tag text-[9px] bg-black text-white border-black">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'playlists' && (
        <section>
          {data?.playlists?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.playlists.map((pl: any) => (
                <a
                  key={pl.id}
                  href={`/playlists/${pl.id}`}
                  className="brutal-card bg-white dark:bg-[#1a1a1a] p-4 block"
                >
                  <div className="w-full aspect-square brutal-border-thin mb-3 flex items-center justify-center bg-brutal-yellow text-4xl">
                    &#9834;
                  </div>
                  <p className="font-bold text-sm truncate uppercase">{pl.name}</p>
                  <p className="text-xs font-mono opacity-50 mt-1">{pl.tracks_count || 0} tracks</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="brutal-border bg-brutal-yellow p-8 text-center">
              <p className="text-xl font-black uppercase">No playlists yet</p>
              <p className="text-sm font-mono mt-2 opacity-70">create one from the player</p>
            </div>
          )}
        </section>
      )}

      {tab === 'liked' && (
        <section>
          {data?.likedTracks?.length > 0 ? (
            <div className="space-y-2">
              {data.likedTracks.map((track: any, i: number) => (
                <TrackCard key={track.id} track={track} index={i} />
              ))}
            </div>
          ) : (
            <div className="brutal-border bg-brutal-pink p-8 text-center">
              <p className="text-xl font-black uppercase">No liked tracks</p>
              <p className="text-sm font-mono mt-2 opacity-70">tap the heart on any track</p>
            </div>
          )}
        </section>
      )}

      {tab === 'history' && (
        <section>
          {data?.history?.length > 0 ? (
            <div className="space-y-2">
              {data.history.slice(0, 30).map((item: any, i: number) => (
                <TrackCard key={item.id} track={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="brutal-border bg-brutal-blue p-8 text-center">
              <p className="text-xl font-black uppercase">No history yet</p>
              <p className="text-sm font-mono mt-2 opacity-70">start listening to see tracks here</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}