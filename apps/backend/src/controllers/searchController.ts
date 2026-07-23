import { Request, Response, NextFunction } from 'express';
import { trackRepository } from '../repositories/trackRepository';
import { albumRepository } from '../repositories/albumRepository';
import { artistRepository } from '../repositories/artistRepository';
import { playlistRepository } from '../repositories/playlistRepository';
import { youtubeService } from '../services/youtubeService';

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q || q.trim().length === 0) {
        return res.json({ tracks: [], albums: [], artists: [], playlists: [] });
      }

      const [localTracks, albums, artists, playlists] = await Promise.all([
        trackRepository.search(q),
        albumRepository.search(q),
        artistRepository.search(q),
        playlistRepository.search(q),
      ]);

      const youtubeTracks = youtubeService.search(q, 8);

      const tracks = [
        ...localTracks.map((t: any) => ({ ...t, source: 'local' })),
        ...youtubeTracks,
      ];

      res.json({ tracks, albums, artists, playlists, youtubeTracks });
    } catch (err) {
      next(err);
    }
  },
};