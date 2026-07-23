import { useQuery } from '@tanstack/react-query';
import { libraryApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { AlbumCard } from '../components/ui/AlbumCard';

export function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: libraryApi.getHome,
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
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">01</span>
          <h2 className="text-2xl font-black uppercase tracking-tight">Recently Played</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {data?.recentlyPlayed?.slice(0, 8).map((item: any, i: number) => (
            <div key={item.id} className="flex-shrink-0 w-44">
              <TrackCard track={item} index={i} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">02</span>
          <h2 className="text-2xl font-black uppercase tracking-tight">Featured Playlists</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.featuredPlaylists?.map((playlist: any, i: number) => (
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

      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">03</span>
          <h2 className="text-2xl font-black uppercase tracking-tight">Top Tracks</h2>
        </div>
        <div className="space-y-2">
          {data?.topTracks?.slice(0, 10).map((track: any, i: number) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}