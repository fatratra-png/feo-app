const API_BASE = '/api';

let accessToken: string | null = localStorage.getItem('feo_access_token');
let refreshToken: string | null = localStorage.getItem('feo_refresh_token');

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('feo_access_token', access);
  localStorage.setItem('feo_refresh_token', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('feo_access_token');
  localStorage.removeItem('feo_refresh_token');
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

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, displayName: string) =>
    api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, displayName }) }),
  me: () => api('/auth/me'),
  logout: () => api('/auth/logout', { method: 'POST' }),
};

// Tracks
export const tracksApi = {
  getAll: (page = 1) => api(`/tracks?page=${page}`),
  getById: (id: string) => api(`/tracks/${id}`),
  getByAlbum: (albumId: string) => api(`/tracks/album/${albumId}`),
  getByArtist: (artistId: string) => api(`/tracks/artist/${artistId}`),
  play: (id: string) => api(`/tracks/${id}/play`, { method: 'POST' }),
};

// Albums
export const albumsApi = {
  getAll: (page = 1) => api(`/albums?page=${page}`),
  getById: (id: string) => api(`/albums/${id}`),
  getByArtist: (artistId: string) => api(`/albums/artist/${artistId}`),
};

// Artists
export const artistsApi = {
  getAll: () => api('/artists'),
  getById: (id: string) => api(`/artists/${id}`),
};

// Playlists
export const playlistsApi = {
  getAll: () => api('/playlists'),
  getById: (id: string) => api(`/playlists/${id}`),
  getMyPlaylists: () => api('/playlists/me'),
  create: (data: { name: string; description?: string; isPublic?: boolean }) =>
    api('/playlists', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    api(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => api(`/playlists/${id}`, { method: 'DELETE' }),
  addTrack: (playlistId: string, trackId: string) =>
    api(`/playlists/${playlistId}/tracks`, { method: 'POST', body: JSON.stringify({ trackId }) }),
  removeTrack: (playlistId: string, trackId: string) =>
    api(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' }),
};

// Likes
export const likesApi = {
  getLikedTracks: () => api('/likes/tracks'),
  getLikedAlbums: () => api('/likes/albums'),
  toggleTrack: (trackId: string) => api(`/likes/tracks/${trackId}`, { method: 'POST' }),
  toggleAlbum: (albumId: string) => api(`/likes/albums/${albumId}`, { method: 'POST' }),
};

// Follows
export const followsApi = {
  getFollowedArtists: () => api('/follows/artists'),
  toggle: (artistId: string) => api(`/follows/artists/${artistId}`, { method: 'POST' }),
};

// Search
export const searchApi = {
  search: (q: string) => api(`/search?q=${encodeURIComponent(q)}`),
};

// Library
export const libraryApi = {
  getLibrary: () => api('/library'),
  getHome: () => api('/library/home'),
};