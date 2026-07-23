import { Request, Response, NextFunction } from 'express';
import { trackRepository } from '../repositories/trackRepository';
import { historyRepository } from '../repositories/historyRepository';
import { AuthRequest } from '../middleware/auth';

export const trackController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await trackRepository.findAll(page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const track = await trackRepository.findById(req.params.id, req.userId);
      if (!track) return res.status(404).json({ message: 'Track not found' });
      res.json(track);
    } catch (err) {
      next(err);
    }
  },

  async getByAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const tracks = await trackRepository.findByAlbum(req.params.albumId);
      res.json(tracks);
    } catch (err) {
      next(err);
    }
  },

  async getByArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const tracks = await trackRepository.findByArtist(req.params.artistId);
      res.json(tracks);
    } catch (err) {
      next(err);
    }
  },

  async play(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const track = await trackRepository.findById(req.params.id);
      if (!track) return res.status(404).json({ message: 'Track not found' });
      await trackRepository.incrementPlays(req.params.id);
      if (req.userId) {
        await historyRepository.add(req.userId, req.params.id);
      }
      res.json({ message: 'Play counted' });
    } catch (err) {
      next(err);
    }
  },
};