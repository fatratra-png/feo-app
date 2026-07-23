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
      <div className="p-8">
        <p className="font-mono text-sm opacity-50">loading...</p>
      </div>
    );
  }

  const isOwner = user?.id === playlist.user_id;

  return (
    <div className="p-8 space-y-10">
      <div className="flex items-end gap-8 brutal-border bg-white dark:bg-[#1a1a1a] p-8">
        <div className="w-48 h-48 brutal-border-thin overflow-hidden flex-shrink-0">
          {playlist.cover_url ? (
            <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brutal-yellow flex items-center justify-center text-6xl font-black">
              {playlist.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1">
          <span className="section-index">PLAYLIST</span>
          {isEditing ? (
            <div className="space-y-2 mt-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="brutal-input px-4 py-2 text-xl font-black w-full"
              />
              <input
                type="text"
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                className="brutal-input px-4 py-2 text-sm w-full"
                placeholder="Description"
              />
              <div className="flex gap-2">
                <button onClick={() => updateMutation.mutate()} className="brutal-btn px-4 py-1 text-xs bg-brutal-yellow">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="brutal-btn px-4 py-1 text-xs">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-black tracking-tight mt-1">{playlist.name}</h1>
              <p className="text-sm font-mono mt-2 opacity-60">
                {playlist.user_name} · {playlist.tracks_count} tracks
              </p>
              {playlist.description && <p className="text-sm mt-2">{playlist.description}</p>}
              {isOwner && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setName(playlist.name);
                      setDescription(playlist.description || '');
                      setIsEditing(true);
                    }}
                    className="brutal-btn px-4 py-1 text-xs bg-white dark:bg-[#333]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this playlist?')) deleteMutation.mutate();
                    }}
                    className="brutal-btn px-4 py-1 text-xs bg-brutal-red text-white"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {playlist.tracks && playlist.tracks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="section-index">01</span>
            <h2 className="text-xl font-black uppercase">Tracks</h2>
          </div>
          <div className="space-y-2">
            {playlist.tracks.map((track: any, i: number) => (
              <div key={track.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <TrackCard track={track} index={i} />
                </div>
                {isOwner && (
                  <button
                    onClick={() => playlistsApi.removeTrack(id!, track.id).then(() => queryClient.invalidateQueries({ queryKey: ['playlist', id] }))}
                    className="brutal-btn px-2 py-1 text-xs bg-brutal-red text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}