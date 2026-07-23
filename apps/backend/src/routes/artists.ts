import { Router } from 'express';
import { artistController } from '../controllers/artistController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', artistController.getAll);
router.get('/:id', optionalAuth, artistController.getById);

export default router;