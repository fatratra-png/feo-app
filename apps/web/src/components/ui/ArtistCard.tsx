import { Link } from 'react-router-dom';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    image_url: string | null;
    followers_count: number;
  };
  index?: number;
}

export function ArtistCard({ artist, index = 0 }: ArtistCardProps) {
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="rounded-2xl border-2 border-foreground bg-card p-5 text-center block transition-all hover:-translate-y-1 hover:-rotate-[0.5deg]"
    >
      {index !== undefined && (
        <span className="eyebrow block mb-3 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      )}
      <div className="size-28 rounded-full border-2 border-foreground overflow-hidden mx-auto mb-4">
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blush to-mint flex items-center justify-center text-3xl font-display font-extrabold text-black">
            {artist.name[0]}
          </div>
        )}
      </div>
      <h3 className="font-display font-bold text-sm uppercase truncate leading-tight">{artist.name}</h3>
      <span className="chip text-[8px] mt-2 inline-block">{artist.followers_count.toLocaleString()} followers</span>
    </Link>
  );
}
