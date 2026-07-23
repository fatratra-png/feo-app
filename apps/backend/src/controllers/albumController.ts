import { Request, Response, NextFunction } from 'express';
import { albumRepository } from '../repositories/albumRepository';
import { AuthRequest } from '../middleware/auth';

export const albumController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await albumRepository.findAll(page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const album = await albumRepository.findById(req.params.id, req.userId);
      if (!album) return res.status(404).json({ message: 'Album not found' });
      res.json(album);
    } catch (err) {
      next(err);
    }
  },

  async getByArtist(req: Request, res: Response, next: NextFunction) {
    try {
      const albums = await albumRepository.findByArtist(req.params.artistId);
      res.json(albums);
    } catch (err) {
      next(err);
    }
  },
};