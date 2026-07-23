import { execSync } from 'child_process';

interface YouTubeTrack {
  id: string;
  title: string;
  duration: number;
  artist_name: string;
  album_title: string;
  album_cover_url: string | null;
  file_url: string | null;
  source: 'youtube';
  youtube_id: string;
  plays_count: number;
}

function parseDuration(duration: number | string): number {
  if (typeof duration === 'number') return Math.round(duration);
  return 0;
}

function parseLine(line: string): YouTubeTrack | null {
  try {
    const data = JSON.parse(line);
    const duration = parseDuration(data.duration || 0);
    const thumbnail = data.thumbnail || data.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`;
    return {
      id: `yt__${data.id}`,
      title: data.title || 'Unknown',
      duration,
      artist_name: data.channel || data.uploader || data.channel_id || 'YouTube',
      album_title: data.album || data.playlist_title || 'YouTube',
      album_cover_url: thumbnail,
      file_url: null,
      source: 'youtube' as const,
      youtube_id: data.id,
      plays_count: data.view_count || 0,
    };
  } catch { return null; }
}

export const youtubeService = {
  search(query: string, maxResults = 15): YouTubeTrack[] {
    try {
      const cmd = `yt-dlp --dump-json --no-warnings --flat-playlist "ytsearch${maxResults}:${query.replace(/"/g, '\\"')}" 2>/dev/null`;
      const output = execSync(cmd, { timeout: 15000, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
      const lines = output.trim().split('\n').filter(Boolean);
      const tracks = lines.map(parseLine).filter(Boolean) as YouTubeTrack[];

      if (tracks.length === 0 && query.trim().length > 0) {
        const fallback = this.search(query.split(' ').slice(0, 2).join(' '), maxResults);
        return fallback.length > 0 ? fallback : this.search('popular music', maxResults);
      }

      return tracks;
    } catch (err) {
      if (query.trim().length > 0) {
        try {
          return this.search('trending music', maxResults);
        } catch { return []; }
      }
      return [];
    }
  },

  getAudioUrl(youtubeId: string): string | null {
    try {
      const url = `https://www.youtube.com/watch?v=${youtubeId}`;
      const cmd = `yt-dlp -f bestaudio --get-url --no-warnings "${url}" 2>/dev/null`;
      const output = execSync(cmd, { timeout: 15000, encoding: 'utf-8', maxBuffer: 1024 * 1024 });
      return output.trim();
    } catch (err) {
      console.error('Failed to get audio URL for', youtubeId, err);
      return null;
    }
  },

  getDetails(youtubeId: string): YouTubeTrack | null {
    try {
      const url = `https://www.youtube.com/watch?v=${youtubeId}`;
      const cmd = `yt-dlp --dump-json --no-warnings "${url}" 2>/dev/null`;
      const output = execSync(cmd, { timeout: 15000, encoding: 'utf-8', maxBuffer: 5 * 1024 * 1024 });
      return parseLine(output.trim());
    } catch (err) {
      console.error('Failed to get YouTube details for', youtubeId, err);
      return null;
    }
  },

  related(query: string, maxResults = 12): YouTubeTrack[] {
    try {
      const tokens = query.split(' ').filter(t => t.length > 0);
      const searchQuery = tokens.slice(0, 5).join(' ') + ' music';
      return this.search(searchQuery, maxResults);
    } catch {
      return [];
    }
  },
};