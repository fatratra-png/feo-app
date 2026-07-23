import { Link } from 'react-router-dom';

interface AlbumCardProps {
  album: {
    id: string;
    title: string;
    cover_url: string | null;
    artist_name: string;
    release_year: number;
    tracks_count: number;
  };
  index?: number;
}

export function AlbumCard({ album, index }: AlbumCardProps) {
  return (
    <Link
      to={`/albums/${album.id}`}
      className="brutal-card block bg-white dark:bg-[#1a1a1a] p-4"
    >
      {index !== undefined && (
        <span className="section-index block mb-2">{String(index + 1).padStart(2, '0')}</span>
      )}
      {album.cover_url && (
        <img
          src={album.cover_url}
          alt={album.title}
          className="w-full aspect-square brutal-border-thin object-cover mb-3"
        />
      )}
      <h3 className="font-bold text-sm truncate">{album.title}</h3>
      <p className="text-xs font-mono opacity-60">{album.artist_name}</p>
      <div className="flex gap-2 mt-2">
        <span className="metadata-tag">{album.release_year}</span>
        <span className="metadata-tag">{album.tracks_count} tracks</span>
      </div>
    </Link>
  );
}