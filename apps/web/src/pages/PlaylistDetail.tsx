import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsApi } from '../lib/api';
import { TrackCard } from '../components/ui/TrackCard';
import { useAuthStore } from '../stores/authStore';

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistsApi.getById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: () => playlistsApi.update(id!, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => playlistsApi.delete(id!),
    onSuccess: () => navigate('/library'),
  });

  if (isLoading || !playlist) {
    return (
      <div className="p-10">
        <div className="flex items-center gap-3 py-8">
          <span className="w-6 h-6 brutal-border-thin animate-spin border-t-transparent" />
          <p className="font-mono text-sm opacity-50">Loading playlist...</p>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === playlist.user_id;

  return (
    <div className="p-10 space-y-12 max-w-6xl mx-auto">
      <div className="brutal-border bg-brutal-yellow p-10 flex items-end gap-10">
        <div className="w-56 h-56 brutal-border-thin overflow-hidden flex-shrink-0 bg-black">
          {playlist.cover_url ? (
            <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl font-black text-white">&#9834;</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="metadata-tag text-[9px] bg-black text-white border-black">Playlist</span>
          {isEditing ? (
            <div className="space-y-3 mt-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="brutal-input px-5 py-3 text-2xl font-black w-full" />
              <input type="text" value={description || ''} onChange={(e) => setDescription(e.target.value)} className="brutal-input px-5 py-3 text-sm w-full" placeholder="Description" />
              <div className="flex gap-3">
                <button onClick={() => updateMutation.mutate()} className="brutal-btn px-6 py-2 text-xs font-bold bg-black text-white">Save</button>
                <button onClick={() => setIsEditing(false)} className="brutal-btn px-6 py-2 text-xs font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-black tracking-tight mt-3 leading-tight">{playlist.name}</h1>
              <p className="text-sm font-mono mt-2 opacity-70">
                {playlist.user_name} &middot; {playlist.tracks_count} tracks
              </p>
              {playlist.description && <p className="text-sm mt-2 opacity-70">{playlist.description}</p>}
              {isOwner && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setName(playlist.name); setDescription(playlist.description || ''); setIsEditing(true); }}                 className="brutal-btn px-5 py-2 text-xs font-bold">Edit</button>
                  <button onClick={() => { if (confirm('Delete this playlist?')) deleteMutation.mutate(); }} className="brutal-btn px-5 py-2 text-xs font-bold bg-brutal-red text-white">Delete</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {playlist.tracks && playlist.tracks.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="section-index text-sm font-bold opacity-40">01</span>
            <h2 className="text-2xl font-black uppercase tracking-tight">Tracks</h2>
            <span className="h-px flex-1 bg-black/20 dark:bg-white/20" />
          </div>
          <div className="space-y-3">
            {playlist.tracks.map((track: any, i: number) => (
              <div key={track.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <TrackCard track={track} index={i} />
                </div>
                {isOwner && (
                  <button
                    onClick={() => playlistsApi.removeTrack(id!, track.id).then(() => queryClient.invalidateQueries({ queryKey: ['playlist', id] }))}
                    className="brutal-btn px-4 py-3 text-xs font-bold bg-brutal-red text-white flex-shrink-0 hover:scale-105 transition-transform"
                  >
                    &#10005;
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {(!playlist.tracks || playlist.tracks.length === 0) && (
        <div className="brutal-border bg-brutal-blue text-white p-10 max-w-lg text-center">
          <p className="text-xl font-black uppercase">Empty playlist</p>
          <p className="text-sm font-mono mt-3 opacity-70">Search for tracks and add them here</p>
        </div>
      )}
    </div>
  );
}