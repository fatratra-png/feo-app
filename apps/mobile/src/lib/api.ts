const API_BASE = 'http://localhost:3001/api';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, displayName: string) =>
    api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  me: () => api('/auth/me'),
};

export const tracksApi = {
  getAll: (page = 1) => api(`/tracks?page=${page}`),
  getById: (id: string) => api(`/tracks/${id}`),
  getByAlbum: (albumId: string) => api(`/tracks/album/${albumId}`),
  getByArtist: (artistId: string) => api(`/tracks/artist/${artistId}`),
};

export const albumsApi = {
  getAll: (page = 1) => api(`/albums?page=${page}`),
  getById: (id: string) => api(`/albums/${id}`),
  getByArtist: (artistId: string) => api(`/albums/artist/${artistId}`),
};

export const artistsApi = {
  getAll: () => api('/artists'),
  getById: (id: string) => api(`/artists/${id}`),
};

export const playlistsApi = {
  getAll: () => api('/playlists'),
  getById: (id: string) => api(`/playlists/${id}`),
  getMyPlaylists: () => api('/playlists/me'),
  create: (data: any) => api('/playlists', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/playlists/${id}`, { method: 'DELETE' }),
  addTrack: (playlistId: string, trackId: string) =>
    api(`/playlists/${playlistId}/tracks`, { method: 'POST', body: JSON.stringify({ trackId }) }),
  removeTrack: (playlistId: string, trackId: string) =>
    api(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' }),
};

export const likesApi = {
  getLikedTracks: () => api('/likes/tracks'),
  toggleTrack: (trackId: string) => api(`/likes/tracks/${trackId}`, { method: 'POST' }),
  toggleAlbum: (albumId: string) => api(`/likes/albums/${albumId}`, { method: 'POST' }),
};

export const followsApi = {
  getFollowedArtists: () => api('/follows/artists'),
  toggle: (artistId: string) => api(`/follows/artists/${artistId}`, { method: 'POST' }),
};

export const searchApi = {
  search: (q: string) => api(`/search?q=${encodeURIComponent(q)}`),
};

export const libraryApi = {
  getLibrary: () => api('/library'),
  getHome: () => api('/library/home'),
};