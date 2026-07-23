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

export function ArtistCard({ artist, index }: ArtistCardProps) {
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="brutal-card block bg-white dark:bg-[#1a1a1a] p-4 text-center"
    >
      {index !== undefined && (
        <span className="section-index block mb-2">{String(index + 1).padStart(2, '0')}</span>
      )}
      <div className="w-24 h-24 rounded-full brutal-border-thin overflow-hidden mx-auto mb-3">
        {artist.image_url ? (
          <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brutal-pink flex items-center justify-center text-2xl font-bold">
            {artist.name[0]}
          </div>
        )}
      </div>
      <h3 className="font-bold text-sm truncate">{artist.name}</h3>
      <span className="metadata-tag text-xs">{artist.followers_count} followers</span>
    </Link>
  );
}