import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { AlbumCard } from '../components/ui/AlbumCard';
import { ArtistCard } from '../components/ui/ArtistCard';

export function Search() {
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.search(query),
    enabled: query.length > 0,
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="section-index">⌕</span>
        <h1 className="text-3xl font-black uppercase tracking-tight">Search</h1>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search artists, albums, tracks..."
        className="brutal-input w-full px-6 py-4 text-lg bg-white dark:bg-[#1a1a1a]"
        autoFocus
      />

      {isLoading && (
        <p className="font-mono text-sm opacity-50">searching...</p>
      )}

      {data && (
        <div className="space-y-10">
          {data.artists?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="section-index">01</span>
                <h2 className="text-xl font-black uppercase">Artists</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {data.artists.map((artist: any, i: number) => (
                  <div key={artist.id} className="flex-shrink-0">
                    <ArtistCard artist={artist} index={i} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.albums?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="section-index">02</span>
                <h2 className="text-xl font-black uppercase">Albums</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.albums.map((album: any, i: number) => (
                  <AlbumCard key={album.id} album={album} index={i} />
                ))}
              </div>
            </section>
          )}

          {data.tracks?.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="section-index">03</span>
                <h2 className="text-xl font-black uppercase">Tracks</h2>
              </div>
              <div className="space-y-2">
                {data.tracks.map((track: any, i: number) => (
                  <TrackCard key={track.id} track={track} index={i} />
                ))}
              </div>
            </section>
          )}

          {data.artists?.length === 0 && data.albums?.length === 0 && data.tracks?.length === 0 && (
            <p className="font-mono text-sm opacity-50">no results found</p>
          )}
        </div>
      )}
    </div>
  );
}