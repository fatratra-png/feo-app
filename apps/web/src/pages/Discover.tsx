import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { youtubeApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';

const GENRES = [
  { id: 'pop', label: 'Pop', icon: '🌟', color: 'bg-brutal-pink', shadow: 'brutal-shadow-pink' },
  { id: 'hiphop', label: 'Hip Hop', icon: '🎤', color: 'bg-brutal-orange', shadow: 'brutal-shadow-orange' },
  { id: 'rnb', label: 'R&B', icon: '🎵', color: 'bg-brutal-purple', shadow: 'brutal-shadow-purple' },
  { id: 'rock', label: 'Rock', icon: '🎸', color: 'bg-brutal-red', shadow: 'brutal-shadow-red' },
  { id: 'electronic', label: 'Electronic', icon: '⚡', color: 'bg-brutal-teal', shadow: 'brutal-shadow-teal' },
  { id: 'jazz', label: 'Jazz', icon: '🎷', color: 'bg-brutal-blue', shadow: 'brutal-shadow-blue' },
  { id: 'classical', label: 'Classical', icon: '🎻', color: 'bg-brutal-green', shadow: 'brutal-shadow-green' },
  { id: 'afro', label: 'Afro', icon: '🥁', color: 'bg-brutal-yellow', shadow: 'brutal-shadow-yellow' },
  { id: 'reggae', label: 'Reggae', icon: '🌴', color: 'bg-brutal-green', shadow: 'brutal-shadow-green' },
  { id: 'latino', label: 'Latino', icon: '💃', color: 'bg-brutal-pink', shadow: 'brutal-shadow-pink' },
];

export function Discover() {
  const [activeId, setActiveId] = useState('pop');
  const active = GENRES.find((g) => g.id === activeId) || GENRES[0];

  const { data, isLoading } = useQuery({
    queryKey: ['yt-discover', activeId],
    queryFn: () => youtubeApi.trending(activeId),
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <span className="section-index text-lg">🌐</span>
        <h1 className="text-3xl font-black uppercase tracking-tight">Discover</h1>
        <span className="metadata-tag text-[9px]">YouTube worldwide</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveId(g.id)}
            className={`${g.color} brutal-border ${g.shadow} px-5 py-3 font-bold uppercase text-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 ${
              activeId === g.id ? 'ring-3 ring-black scale-105' : ''
            }`}
          >
            {g.icon} {g.label}
          </button>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="section-index">01</span>
          <h2 className="text-2xl font-black uppercase">{active.label}</h2>
          <span className="metadata-tag text-[9px]">Trending</span>
        </div>
        {isLoading ? (
          <p className="font-mono text-sm opacity-50 animate-pulse">loading worldwide tracks...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data?.tracks?.map((track: any, i: number) => (
              <TrackCard key={track.id} track={track} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}