import { Response, NextFunction } from 'express';
import { playlistRepository } from '../repositories/playlistRepository';
import { likeRepository } from '../repositories/likeRepository';
import { followRepository } from '../repositories/followRepository';
import { historyRepository } from '../repositories/historyRepository';
import { trackRepository } from '../repositories/trackRepository';
import { AuthRequest } from '../middleware/auth';

export const libraryController = {
  async getLibrary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [playlists, likedTracks, likedAlbums, followedArtists, history] = await Promise.all([
        playlistRepository.findByUser(req.userId!),
        likeRepository.getUserLikedTracks(req.userId!),
        likeRepository.getUserLikedAlbums(req.userId!),
        followRepository.getUserFollowedArtists(req.userId!),
        historyRepository.getByUser(req.userId!),
      ]);

      res.json({ playlists, likedTracks, likedAlbums, followedArtists, history });
    } catch (err) {
      next(err);
    }
  },

  async getHome(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [recentlyPlayed, featuredPlaylists, topTracks] = await Promise.all([
        historyRepository.getByUser(req.userId!, 10),
        playlistRepository.findAll(1, 6),
        trackRepository.findAll(1, 10),
      ]);

      res.json({ recentlyPlayed, featuredPlaylists: featuredPlaylists.rows, topTracks: topTracks.rows });
    } catch (err) {
      next(err);
    }
  },
};