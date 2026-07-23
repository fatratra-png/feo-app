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

const COLORS = ['bg-saffron', 'bg-blush', 'bg-mint', 'bg-saffron', 'bg-blush', 'bg-mint'];

export function AlbumCard({ album, index = 0 }: AlbumCardProps) {
  return (
    <Link
      to={`/albums/${album.id}`}
      className="rounded-2xl border-2 border-foreground bg-card p-5 block transition-all hover:-translate-y-1 hover:-rotate-[0.5deg]"
    >
      {index !== undefined && (
        <span className="eyebrow block mb-2 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      )}
      <div className={`w-full aspect-square rounded-xl border-2 border-foreground mb-4 flex items-center justify-center ${COLORS[index % COLORS.length]} overflow-hidden`}>
        {album.cover_url ? (
          <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl font-display font-extrabold text-black/30">&#9834;</span>
        )}
      </div>
      <h3 className="font-display font-bold text-xs uppercase truncate leading-tight">{album.title}</h3>
      <p className="eyebrow mt-1 truncate">{album.artist_name}</p>
      <div className="flex gap-2 mt-2">
        <span className="chip text-[7px]">{album.release_year}</span>
        <span className="chip text-[7px]">{album.tracks_count} tracks</span>
      </div>
    </Link>
  );
}
