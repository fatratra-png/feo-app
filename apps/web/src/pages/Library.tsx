import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { AlbumCard } from '../components/ui/AlbumCard';
import { ArtistCard } from '../components/ui/ArtistCard';

export function Library() {
  const { data, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: libraryApi.getLibrary,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm opacity-50">loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-center gap-3">
        <span className="section-index">☰</span>
        <h1 className="text-3xl font-black uppercase tracking-tight">Your Library</h1>
      </div>

      {data?.playlists?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">01</span>
            <h2 className="text-xl font-black uppercase">Playlists</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.playlists.map((playlist: any, i: number) => (
              <AlbumCard
                key={playlist.id}
                album={{
                  id: playlist.id,
                  title: playlist.name,
                  cover_url: playlist.cover_url,
                  artist_name: playlist.user_name,
                  release_year: new Date(playlist.created_at).getFullYear(),
                  tracks_count: playlist.tracks_count,
                }}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {data?.likedTracks?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">02</span>
            <h2 className="text-xl font-black uppercase">Liked Tracks</h2>
          </div>
          <div className="space-y-2">
            {data.likedTracks.map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}

      {data?.followedArtists?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">03</span>
            <h2 className="text-xl font-black uppercase">Followed Artists</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {data.followedArtists.map((artist: any, i: number) => (
              <div key={artist.id} className="flex-shrink-0">
                <ArtistCard artist={artist} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data?.history?.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">04</span>
            <h2 className="text-xl font-black uppercase">Listening History</h2>
          </div>
          <div className="space-y-2">
            {data.history.slice(0, 20).map((item: any, i: number) => (
              <TrackCard key={item.id} track={item} index={i} />
            ))}
          </div>
        </section>
      )}

      {(!data?.playlists?.length && !data?.likedTracks?.length) && (
        <p className="font-mono text-sm opacity-50">your library is empty. start exploring!</p>
      )}
    </div>
  );
}