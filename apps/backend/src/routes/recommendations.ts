import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upNext, skip } from '../controllers/recommendationController';

const router = Router();

router.get('/up-next', authenticate, upNext);
router.post('/skip', authenticate, skip);

export default router;
