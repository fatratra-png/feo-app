import { Request, Response, NextFunction } from 'express';
import { youtubeService } from '../services/youtubeService';

export const youtubeController = {
  search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      if (!q || q.trim().length === 0) {
        return res.json({ tracks: [] });
      }
      const tracks = youtubeService.search(q);
      res.json({ tracks });
    } catch (err) {
      next(err);
    }
  },

  async getAudioUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { youtubeId } = req.params;
      const audioUrl = youtubeService.getAudioUrl(youtubeId);
      if (!audioUrl) {
        return res.status(404).json({ message: 'Could not extract audio URL' });
      }
      res.json({ audioUrl, youtubeId });
    } catch (err) {
      next(err);
    }
  },

  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { youtubeId } = req.params;
      const details = youtubeService.getDetails(youtubeId);
      if (!details) {
        return res.status(404).json({ message: 'Video not found' });
      }
      res.json(details);
    } catch (err) {
      next(err);
    }
  },
};