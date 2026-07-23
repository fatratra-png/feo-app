import { Request, Response, NextFunction } from 'express';
import { artistRepository } from '../repositories/artistRepository';
import { AuthRequest } from '../middleware/auth';

export const artistController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await artistRepository.findAll(page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const artist = await artistRepository.findById(req.params.id, req.userId);
      if (!artist) return res.status(404).json({ message: 'Artist not found' });
      res.json(artist);
    } catch (err) {
      next(err);
    }
  },
};