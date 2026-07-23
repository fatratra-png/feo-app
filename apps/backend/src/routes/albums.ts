import { Router } from 'express';
import { albumController } from '../controllers/albumController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', albumController.getAll);
router.get('/:id', optionalAuth, albumController.getById);
router.get('/artist/:artistId', albumController.getByArtist);

export default router;