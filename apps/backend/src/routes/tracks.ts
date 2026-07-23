import { Router } from 'express';
import { trackController } from '../controllers/trackController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', trackController.getAll);
router.get('/:id', optionalAuth, trackController.getById);
router.get('/album/:albumId', trackController.getByAlbum);
router.get('/artist/:artistId', trackController.getByArtist);
router.post('/:id/play', authenticate, trackController.play);

export default router;