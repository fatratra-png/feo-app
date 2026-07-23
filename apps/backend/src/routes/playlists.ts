import { Router } from 'express';
import { playlistController } from '../controllers/playlistController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', playlistController.getAll);
router.get('/me', authenticate, playlistController.getMyPlaylists);
router.get('/:id', playlistController.getById);
router.post('/', authenticate, playlistController.create);
router.put('/:id', authenticate, playlistController.update);
router.delete('/:id', authenticate, playlistController.delete);
router.post('/:id/tracks', authenticate, playlistController.addTrack);
router.delete('/:id/tracks/:trackId', authenticate, playlistController.removeTrack);
router.put('/:id/tracks/reorder', authenticate, playlistController.reorderTracks);

export default router;