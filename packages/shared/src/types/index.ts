// ── User ──
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// ── Artist ──
export interface Artist {
  id: string;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  followersCount: number;
  isFollowed?: boolean;
}

// ── Album ──
export interface Album {
  id: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number;
  artistId: string;
  artistName: string;
  tracksCount: number;
  isLiked?: boolean;
}

// ── Track ──
export interface Track {
  id: string;
  title: string;
  duration: number;
  fileUrl: string | null;
  trackNumber: number;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  albumCoverUrl: string | null;
  isLiked?: boolean;
}

// ── Playlist ──
export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  userId: string;
  userName: string;
  isPublic: boolean;
  tracksCount: number;
  createdAt: string;
  tracks?: Track[];
}

// ── Search Results ──
export interface SearchResults {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

// ── Listening History ──
export interface ListeningHistoryEntry {
  id: string;
  trackId: string;
  track: Track;
  listenedAt: string;
}

// ── API Responses ──
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}