import { Request, Response, NextFunction } from 'express';
import { trackRepository } from '../repositories/trackRepository';
import { albumRepository } from '../repositories/albumRepository';
import { artistRepository } from '../repositories/artistRepository';
import { playlistRepository } from '../repositories/playlistRepository';

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q || q.trim().length === 0) {
        return res.json({ tracks: [], albums: [], artists: [], playlists: [] });
      }

      const [tracks, albums, artists, playlists] = await Promise.all([
        trackRepository.search(q),
        albumRepository.search(q),
        artistRepository.search(q),
        playlistRepository.search(q),
      ]);

      res.json({ tracks, albums, artists, playlists });
    } catch (err) {
      next(err);
    }
  },
};