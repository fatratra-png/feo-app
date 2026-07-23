import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artistsApi, tracksApi, albumsApi, followsApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { AlbumCard } from '../components/ui/AlbumCard';

export function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistsApi.getById(id!),
    enabled: !!id,
  });

  const { data: tracks } = useQuery({
    queryKey: ['artist-tracks', id],
    queryFn: () => tracksApi.getByArtist(id!),
    enabled: !!id,
  });

  const { data: albums } = useQuery({
    queryKey: ['artist-albums', id],
    queryFn: () => albumsApi.getByArtist(id!),
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: () => followsApi.toggle(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artist', id] }),
  });

  if (isLoading || !artist) {
    return (
      <div className="p-8">
        <p className="font-mono text-sm opacity-50">loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-end gap-8 brutal-border bg-white dark:bg-[#1a1a1a] p-8">
        <div className="w-48 h-48 brutal-border-thin overflow-hidden flex-shrink-0">
          {artist.image_url ? (
            <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brutal-pink flex items-center justify-center text-6xl font-black">
              {artist.name[0]}
            </div>
          )}
        </div>
        <div>
          <span className="section-index">ARTIST</span>
          <h1 className="text-5xl font-black tracking-tight mt-1">{artist.name}</h1>
          <p className="text-sm font-mono mt-2 opacity-60">{artist.followers_count} followers</p>
          {artist.bio && <p className="text-sm mt-4 max-w-lg">{artist.bio}</p>}
          <button
            onClick={() => followMutation.mutate()}
            className={`brutal-btn mt-4 px-6 py-2 text-sm font-bold ${
              artist.is_followed ? 'bg-brutal-pink text-white' : 'bg-white dark:bg-[#333]'
            }`}
          >
            {artist.is_followed ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      {tracks && tracks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">01</span>
            <h2 className="text-xl font-black uppercase">Popular Tracks</h2>
          </div>
          <div className="space-y-2">
            {tracks.slice(0, 5).map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}

      {albums && albums.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">02</span>
            <h2 className="text-xl font-black uppercase">Albums</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {albums.map((album: any, i: number) => (
              <AlbumCard key={album.id} album={album} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}