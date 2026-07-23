import { Router } from 'express';
import { followController } from '../controllers/followController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/artists', authenticate, followController.getFollowedArtists);
router.post('/artists/:artistId', authenticate, followController.toggle);

export default router;