import { Router } from 'express';
import { likeController } from '../controllers/likeController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/tracks', authenticate, likeController.getLikedTracks);
router.get('/albums', authenticate, likeController.getLikedAlbums);
router.post('/tracks/:trackId', authenticate, likeController.toggleTrack);
router.post('/albums/:albumId', authenticate, likeController.toggleAlbum);

export default router;