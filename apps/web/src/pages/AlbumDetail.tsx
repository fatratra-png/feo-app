import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { albumsApi, tracksApi, likesApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';

export function AlbumDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => albumsApi.getById(id!),
    enabled: !!id,
  });

  const { data: tracks } = useQuery({
    queryKey: ['album-tracks', id],
    queryFn: () => tracksApi.getByAlbum(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleAlbum(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['album', id] }),
  });

  if (isLoading || !album) {
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
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brutal-blue flex items-center justify-center text-6xl font-black text-white">
              {album.title[0]}
            </div>
          )}
        </div>
        <div>
          <span className="section-index">ALBUM</span>
          <h1 className="text-5xl font-black tracking-tight mt-1">{album.title}</h1>
          <p className="text-sm font-mono mt-2 opacity-60">
            {album.artist_name} · {album.release_year} · {album.tracks_count} tracks
          </p>
          <button
            onClick={() => likeMutation.mutate()}
            className={`brutal-btn mt-4 px-6 py-2 text-sm font-bold ${
              album.is_liked ? 'bg-brutal-red text-white' : 'bg-white dark:bg-[#333]'
            }`}
          >
            {album.is_liked ? '♥ Liked' : '♡ Like'}
          </button>
        </div>
      </div>

      {tracks && tracks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">01</span>
            <h2 className="text-xl font-black uppercase">Tracks</h2>
          </div>
          <div className="space-y-2">
            {tracks.map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}