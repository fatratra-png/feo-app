import { Request, Response } from 'express';
import { youtubeService } from '../services/youtubeService';

export const searchController = {
  async search(req: Request, res: Response) {
    const q = req.query.q as string;
    if (!q || q.trim().length === 0) {
      return res.json({ tracks: [], artists: [], albums: [] });
    }

    const tracks = youtubeService.search(q, 20);
    res.json({ tracks, artists: [], albums: [] });
  },
};